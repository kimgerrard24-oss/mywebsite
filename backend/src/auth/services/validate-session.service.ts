// src/auth/services/validate-session.service.ts

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ValidateSessionService.name); // เพิ่ม logger ที่นี่

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

      // ใช้ RedisService เพื่อดึงข้อมูล session
      sessionJson = await this.redisService.get(redisKey);

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

      // หาก session มีค่า userId, ส่งข้อมูลผู้ใช้กลับ
      return { userId: session.userId };
    } catch (error) {
      this.logger.error('Error verifying or fetching session', error); // ใช้งาน logger ที่นี่
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}


