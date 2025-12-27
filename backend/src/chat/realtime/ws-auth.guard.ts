// backend/src/chat/realtime/ws-auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
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
      throw new UnauthorizedException('Missing cookie');
    }

    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, decodeURIComponent(v.join('='))];
      }),
    );

    const token = cookies['phl_access'];
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!,
      ) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const sessionKey = `session:access:${payload.jti}`;
    const exists = await this.redis.exists(sessionKey);

    if (!exists) {
      throw new UnauthorizedException('Session expired');
    }

    // attach user (authority = backend)
    (client as any).user = {
      userId: payload.sub,
      jti: payload.jti,
    };

    return true;
  }
}
