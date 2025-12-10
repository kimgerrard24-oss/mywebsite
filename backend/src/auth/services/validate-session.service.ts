// src/auth/services/validate-session.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { RedisService } from '../../redis/redis.service'; // ใช้ service ของคุณเอง

export interface SessionUser {
  userId: string;
}

const ACCESS_TOKEN_COOKIE_NAME =
  process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access';

@Injectable()
export class ValidateSessionService {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService, // << เพิ่มอันนี้
  ) {}

  /**
   * Validate access token from HTTP-only cookie and return SessionUser
   * Local Auth version — ไม่ใช้ Firebase
   */
  async validateAccessTokenFromRequest(req: Request): Promise<SessionUser> {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Access token cookie is missing');
    }

    try {
      // 1) Verify JWT signature & expiration
      const payload = await this.authService.verifyAccessToken(token);

      if (!payload || !payload.sub || !payload.jti) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // 2) Check Redis for active session
      const redisKey = `session:access:${payload.jti}`;
      const sessionJson = await this.redisService.get(redisKey);

      if (!sessionJson) {
        throw new UnauthorizedException('Session expired or revoked');
      }

      // 3) Parse and validate content
      const session = JSON.parse(sessionJson);

      if (!session || !session.userId) {
        throw new UnauthorizedException('Invalid session data');
      }

      // 4) Return SessionUser for controllers
      return { userId: session.userId };
    } catch (err) {
      // NOTE: DON'T log the token here
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

