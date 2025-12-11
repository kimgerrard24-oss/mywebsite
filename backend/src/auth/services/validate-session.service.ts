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

  /**
   * Validate JWT + Redis JTI session
   * rawToken (optional) = decoded Base64URL cookie string
   */
  async validateAccessTokenFromRequest(
    req: Request,
    rawToken?: string | null,
  ): Promise<SessionUser> {
    // 1) ดึง token จาก cookie ก่อน
    const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];

    // 2) ถ้า rawToken ถูกส่งมา → ใช้ rawToken
    const token = rawToken || cookieToken;

    if (!token) {
      throw new UnauthorizedException('Access token cookie is missing');
    }

    try {
      // ✔ verify signature + expiry + jti + redis pointer
      const payload = await this.authService.verifyAccessToken(token);

      const { sub, jti } = payload as any;
      if (!sub || !jti) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // ✔ Redis session pointer
      const redisKey = `session:access:${jti}`;

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
