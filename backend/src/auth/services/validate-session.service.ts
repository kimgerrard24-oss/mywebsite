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
import { SecurityEventService } from '../../common/security/security-event.service';

export interface SessionUser {
  userId: string;
  jti: string;
}

const ACCESS_TOKEN_COOKIE_NAME =
  process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access';

@Injectable()
export class ValidateSessionService {
  private readonly logger = new Logger(
    ValidateSessionService.name,
  );

  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
    private readonly securityEvent: SecurityEventService,
  ) {}

  /**
   * Validate JWT + Redis session pointer
   * Backend = Authority
   */
  async validateAccessTokenFromRequest(
    req: Request,
    rawToken?: string | null,
  ): Promise<SessionUser> {
    const cookieToken =
      req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];
    const token = rawToken ?? cookieToken;

    if (!token) {
      this.logger.warn(
        'Access token cookie is missing',
      );

      // ---- Security Event ----
      this.securityEvent.log({
        type: 'auth.session.missing',
        severity: 'warning',
        path: req.originalUrl || req.url,
        meta: {
          hasCookieHeader: Boolean(
            req.headers?.cookie,
          ),
        },
      });

      throw new UnauthorizedException(
        'Access token cookie is missing',
      );
    }

    try {
      // =====================================================
      // 1) Verify JWT (signature + exp)
      // =====================================================
      const payload =
        await this.authService.verifyAccessToken(
          token,
        );

      if (!payload || typeof payload !== 'object') {
        this.logger.warn('Invalid token payload');

        this.securityEvent.log({
          type: 'auth.jwt.invalid',
          severity: 'warning',
          path: req.originalUrl || req.url,
          meta: {
            reason: 'payload_not_object',
          },
        });

        throw new UnauthorizedException(
          'Invalid token payload',
        );
      }

      // =====================================================
      // 2) Extract jti
      // =====================================================
      const jti =
        (payload as any).jti ??
        (payload as any).sessionId ??
        (payload as any)?.data?.jti;

      if (!jti) {
        this.logger.warn('JWT missing jti');

        this.securityEvent.log({
          type: 'auth.jwt.invalid',
          severity: 'warning',
          path: req.originalUrl || req.url,
          meta: {
            reason: 'missing_jti',
          },
        });

        throw new UnauthorizedException(
          'Invalid token payload',
        );
      }

      // =====================================================
      // 3) Load session from Redis (AUTHORITY)
      // =====================================================
      const redisKey = `session:access:${jti}`;
      const rawSession =
        await this.redisService.get(redisKey);

      if (!rawSession) {
        this.logger.warn(
          `Session expired or revoked for jti`,
        );

        this.securityEvent.log({
          type: 'auth.session.revoked',
          severity: 'warning',
          path: req.originalUrl || req.url,
        });

        throw new UnauthorizedException(
          'Session expired or revoked',
        );
      }

      // =====================================================
      // 4) Parse session
      // =====================================================
      let session: any;

      if (typeof rawSession === 'string') {
        try {
          session = JSON.parse(rawSession);
        } catch {
          this.logger.error(
            `Failed to parse session JSON`,
          );

          this.securityEvent.log({
            type: 'auth.session.revoked',
            severity: 'error',
            path: req.originalUrl || req.url,
            meta: {
              reason: 'session_json_parse_failed',
            },
          });

          throw new UnauthorizedException(
            'Invalid session data',
          );
        }
      } else {
        session = rawSession;
      }

      // =====================================================
      // 5) Resolve userId (HARD REQUIRE)
      // =====================================================
      const userId =
        session.userId ??
        session.payload?.userId ??
        session.sub ??
        session.id;

      if (!userId) {
        this.logger.warn(
          `Invalid session data (missing userId)`,
        );

        this.securityEvent.log({
          type: 'auth.session.revoked',
          severity: 'error',
          path: req.originalUrl || req.url,
          meta: {
            reason: 'missing_user_id',
          },
        });

        throw new UnauthorizedException(
          'Invalid session data',
        );
      }

      // =====================================================
      // 🔒 GLOBAL BAN POLICY (DB is authority)
      // =====================================================
      const isBanned =
        await this.authService.isUserBanned(
          userId,
        );

      if (isBanned) {
        this.logger.warn(
          `Blocked banned user: userId=${userId}`,
        );

        this.securityEvent.log({
          type: 'security.abuse.detected',
          severity: 'warning',
          userId,
          path: req.originalUrl || req.url,
          meta: {
            reason: 'banned_user_attempt',
          },
        });

        throw new ForbiddenException(
          'User is banned',
        );
      }

      // =====================================================
// 🔒 ACCOUNT LOCK POLICY (DB authority)  ✅ ADD HERE
// =====================================================
const isLocked =
  await this.authService.isUserAccountLocked(userId);

if (isLocked) {
  this.logger.warn(
    `Blocked locked account: userId=${userId}`,
  );

  this.securityEvent.log({
    type: 'security.abuse.detected',
    severity: 'warning',
    userId,
    path: req.originalUrl || req.url,
    meta: {
      reason: 'account_locked_access_attempt',
    },
  });

  throw new ForbiddenException('Account is locked');
}

      // =====================================================
      // 6) Best-effort touch (NO Redis write, NO TTL)
      // =====================================================
      this.touchSession(jti, session).catch(
        () => {},
      );

      return { userId, jti };
    } catch (err) {
      // ✅ Preserve ForbiddenException (ban)
      if (err instanceof ForbiddenException) {
        throw err;
      }

      const msg =
        err instanceof Error
          ? err.message
          : String(err);

      this.logger.error(
        `validateAccessTokenFromRequest failed: ${msg}`,
      );

      // ---- Fallback Security Event (unexpected path) ----
      this.securityEvent.log({
        type: 'auth.jwt.invalid',
        severity: 'warning',
        path: req.originalUrl || req.url,
        meta: {
          reason: 'unexpected_validation_error',
        },
      });

      throw new UnauthorizedException('Unauthorized');
    }
  }

  /**
   * Update lastSeenAt in-memory only
   * IMPORTANT:
   * - Do NOT write back to Redis
   * - Do NOT touch TTL
   */
  async touchSession(
    jti: string,
    session: any,
  ): Promise<void> {
    if (!session || typeof session !== 'object')
      return;

    try {
      session.lastSeenAt =
        new Date().toISOString();
    } catch {
      // best-effort only
    }
  }
}
