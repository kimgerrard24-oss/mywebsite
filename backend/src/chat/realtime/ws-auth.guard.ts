// backend/src/chat/realtime/ws-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
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
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) {
      return false;
    }

    let cookies: Record<string, string>;
    try {
      cookies = cookie.parse(cookieHeader);
    } catch {
      return false;
    }

    const token = cookies['phl_access'];
    if (!token) {
      return false;
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!,
      ) as JwtPayload;
    } catch {
      return false;
    }

    const sessionKey = `session:access:${payload.jti}`;
    const exists = await this.redis.exists(sessionKey);

    if (!exists) {
      return false;
    }

    // attach user (backend authority)
    (client as any).user = {
      userId: payload.sub,
      jti: payload.jti,
    };

    return true;
  }
}

