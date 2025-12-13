// src/auth/services/validate-session.service.ts

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { RedisService } from '../../redis/redis.service';

export interface SessionUser {
  userId: string;
  jti: string;
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
   * Validate JWT + Redis session pointer
   */
  async validateAccessTokenFromRequest(
    req: Request,
    rawToken?: string | null,
  ): Promise<SessionUser> {
    const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];
    const token = rawToken || cookieToken;

    if (!token) {
      this.logger.warn('Access token cookie is missing');
      throw new UnauthorizedException('Access token cookie is missing');
    }

    try {
      // 1) Verify JWT (signature + exp)
      const payload = await this.authService.verifyAccessToken(token);

      if (!payload || typeof payload !== 'object') {
        this.logger.warn('Invalid token payload');
        throw new UnauthorizedException('Invalid token payload');
      }

      // 2) Extract jti
      const jti =
        (payload as any).jti ??
        (payload as any).sessionId ??
        (payload as any)?.data?.jti;

      if (!jti) {
        this.logger.warn('JWT missing jti');
        throw new UnauthorizedException('Invalid token payload');
      }

      // 3) Load session from Redis
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
        this.logger.error(`Failed to parse session JSON for jti: ${jti}`);
        throw new UnauthorizedException('Invalid session data');
      }

      // 4) Normalize userId (backward compatible)
      const userId =
        session.userId ??
        session.payload?.userId ??
        session.sub ??
        session.id;

      if (!userId) {
        this.logger.warn(`Invalid session data for jti: ${jti}`);
        throw new UnauthorizedException('Invalid session data');
      }

      // 5) Touch session activity (NO TTL reset)
      this.touchSession(jti).catch(() => {});

      return { userId, jti };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`validateAccessTokenFromRequest failed: ${msg}`);
      throw new UnauthorizedException('Unauthorized');
    }
  }

  /**
   * Update lastSeenAt (best-effort, no TTL reset)
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

      // ⚠️ IMPORTANT:
      // Do NOT reset TTL — let Redis expiry handle access token lifetime
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
