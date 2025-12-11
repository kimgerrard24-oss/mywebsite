// src/auth/services/validate-session.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { RedisService } from '../../redis/redis.service';

export interface SessionUser {
  userId: string;
}

const ACCESS_TOKEN_COOKIE_NAME =
  process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access';

@Injectable()
export class ValidateSessionService {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  async validateAccessTokenFromRequest(req: Request): Promise<SessionUser> {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Access token cookie is missing');
    }

    try {
      // ✔ verify JWT (signature + expiry)
      const payload = await this.authService.verifyAccessToken(token);

      // ✔ payload ต้องมี sub เท่านั้น (ไม่ใช้ jti แล้ว)
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // ✔ แบบใหม่: ใช้ accessToken เป็น redis key
      const redisKey = `session:access:${token}`;

      let sessionJson: string | null = null;

      if (typeof this.redisService.get === 'function') {
        sessionJson = await this.redisService.get(redisKey);
      } else if (typeof (this.redisService as any).getValue === 'function') {
        sessionJson = await (this.redisService as any).getValue(redisKey);
      }

      if (!sessionJson) {
        throw new UnauthorizedException('Session expired or revoked');
      }

      let session;
      try {
        session = JSON.parse(sessionJson);
      } catch {
        throw new UnauthorizedException('Invalid session data');
      }

      if (!session || !session.userId) {
        throw new UnauthorizedException('Invalid session data');
      }

      return { userId: session.userId };
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
