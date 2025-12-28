// backend/src/chat/realtime/ws-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import { RedisService } from '../../redis/redis.service';

type JwtPayload = {
  sub: string;
  jti: string;
};

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    this.logger.log(
      `[WS AUTH] Incoming socket handshake (id=${client.id})`,
    );

    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) {
      this.logger.warn(
        '[WS AUTH] Blocked: no cookie header',
      );
      return false;
    }

    let cookies: Record<string, string>;
    try {
      cookies = cookie.parse(cookieHeader);
    } catch {
      this.logger.warn(
        '[WS AUTH] Blocked: failed to parse cookie',
      );
      return false;
    }

    const token = cookies['phl_access'];
    if (!token) {
      this.logger.warn(
        '[WS AUTH] Blocked: phl_access cookie missing',
      );
      return false;
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!,
      ) as JwtPayload;
    } catch {
      this.logger.warn(
        '[WS AUTH] Blocked: invalid JWT',
      );
      return false;
    }

    const sessionKey = `session:access:${payload.jti}`;
    const exists = await this.redis.exists(sessionKey);

    if (!exists) {
      this.logger.warn(
        `[WS AUTH] Blocked: session not found (jti=${payload.jti})`,
      );
      return false;
    }

    // attach user (backend authority)
    (client as any).user = {
      userId: payload.sub,
      jti: payload.jti,
    };

    this.logger.log(
      `[WS AUTH] Authorized user=${payload.sub} jti=${payload.jti}`,
    );

    return true;
  }
}
