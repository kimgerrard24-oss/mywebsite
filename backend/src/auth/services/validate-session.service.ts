// src/auth/services/validate-session.service.ts

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { RedisService } from '../../redis/redis.service';

export interface SessionUser {
  userId: string;
  jti: string; // ใช้สำหรับ session activity tracking
}

const ACCESS_TOKEN_COOKIE_NAME =
  process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access';

@Injectable()
export class ValidateSessionService {
  private readonly logger = new Logger(ValidateSessionService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Validate JWT + Redis pointer (jti)
   */
  async validateAccessTokenFromRequest(
    req: Request,
    rawToken?: string | null,
  ): Promise<SessionUser> {
    // 1) Extract token from cookie or passed raw token
    const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];
    const token = rawToken || cookieToken;

    if (!token) {
      this.logger.warn('Access token cookie is missing');
      throw new UnauthorizedException('Access token cookie is missing');
    }

    try {
      // 2) Verify JWT signature + expiry
      const payload = await this.authService.verifyAccessToken(token);

      if (!payload || typeof payload !== 'object') {
        this.logger.warn('Invalid token payload: not an object');
        throw new UnauthorizedException('Invalid token payload');
      }

      // 3) Normalize sub + jti
      const sub =
        (payload as any).sub ??
        (payload as any).userId ??
        (payload as any)?.data?.sub;

      const jti =
        (payload as any).jti ??
        (payload as any).sessionId ??
        (payload as any)?.data?.jti;

      if (!sub || !jti) {
        this.logger.warn(`Invalid token payload: sub=${sub}, jti=${jti}`);
        throw new UnauthorizedException('Invalid token payload');
      }

      // 4) Load session from Redis
      const redisKey = `session:access:${jti}`;
      const sessionJson = await this.redisService.get(redisKey);

      if (!sessionJson) {
        this.logger.warn(`Session expired or revoked for jti: ${jti}`);
        throw new UnauthorizedException('Session expired or revoked');
      }

      let session: any;
      try {
        session = JSON.parse(sessionJson);
      } catch {
        this.logger.error(
          `Failed to parse session data from Redis for jti: ${jti}`,
        );
        throw new UnauthorizedException('Invalid session data');
      }

      if (!session || !session.userId) {
        this.logger.warn(`Invalid session data for jti: ${jti}`);
        throw new UnauthorizedException('Invalid session data');
      }

      // 5) 🔹 Touch session (update lastSeenAt) — best effort
      this.touchSession(jti).catch(() => {});

      return {
        userId: session.userId,
        jti,
      };
    } catch (err: unknown) {
      const safeError =
        err instanceof Error ? err.message : String(err);

      this.logger.error(
        `validateAccessTokenFromRequest failed: ${safeError}`,
      );

      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  /**
   * Update session lastSeenAt (best-effort)
   * ใช้สำหรับ activity tracking / multi-device
   */
  async touchSession(jti: string): Promise<void> {
    const redisKey = `session:access:${jti}`;

    try {
      const raw = await this.redisService.get(redisKey);
      if (!raw) return;

      let session: any;
      try {
        session = JSON.parse(raw);
      } catch {
        return;
      }

      session.lastSeenAt = new Date().toISOString();

      await this.redisService.set(redisKey, JSON.stringify(session));
    } catch (err) {
      this.logger.warn(
        `Failed to touch session for jti=${jti}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
