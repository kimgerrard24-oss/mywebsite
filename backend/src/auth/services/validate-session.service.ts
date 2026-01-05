// src/auth/services/validate-session.service.ts

import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { RedisService } from '../../redis/redis.service';

export interface SessionUser {
  userId: string;
  jti: string;
  email: string;
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
    const token = rawToken ?? cookieToken;

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
      const rawSession = await this.redisService.get(redisKey);

      if (!rawSession) {
        this.logger.warn(`Session expired or revoked for jti: ${jti}`);
        throw new UnauthorizedException('Session expired or revoked');
      }

      // 4) Parse session
      let session: any;
      if (typeof rawSession === 'string') {
        try {
          session = JSON.parse(rawSession);
        } catch {
          this.logger.error(`Failed to parse session JSON for jti: ${jti}`);
          throw new UnauthorizedException('Invalid session data');
        }
      } else {
        session = rawSession;
      }

      // 5) Resolve userId
const userId =
  session.userId ??
  session.payload?.userId ??
  session.sub ??
  session.id;

if (!userId) {
  this.logger.warn(`Invalid session data for jti: ${jti}`);
  throw new UnauthorizedException('Invalid session data');
}

// 6) Resolve email (after userId is confirmed)
const email =
  session.email ??
  session.payload?.email ??
  session.user?.email ??
  null;

if (!email) {
  this.logger.warn(
    `Session missing email for userId=${userId}`,
  );
  throw new UnauthorizedException('Invalid session data');
}

      // 🔒 GLOBAL BAN POLICY (DB is authority)
      const isBanned = await this.authService.isUserBanned(userId);

      if (isBanned) {
        this.logger.warn(`Blocked banned user: userId=${userId}`);
        throw new ForbiddenException('User is banned');
      }

      // 6) Best-effort touch (NO write back, NO TTL risk)
      this.touchSession(jti, session).catch(() => {});

      return { userId, jti, email };
    } catch (err) {
      // ✅ Preserve ForbiddenException (ban)
      if (err instanceof ForbiddenException) {
        throw err;
      }

      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`validateAccessTokenFromRequest failed: ${msg}`);
      throw new UnauthorizedException('Unauthorized');
    }
  }

  /**
   * Update lastSeenAt in-memory only
   * IMPORTANT:
   * - Do NOT write back to Redis
   * - Do NOT touch TTL
   */
  async touchSession(jti: string, session: any): Promise<void> {
    if (!session || typeof session !== 'object') return;

    try {
      session.lastSeenAt = new Date().toISOString();
    } catch {
      // best-effort only
    }
  }
}
