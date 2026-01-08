// src/auth/guards/access-token-cookie.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ValidateSessionService } from '../services/validate-session.service';
import { SecurityEventService } from '../../common/security/security-event.service';

@Injectable()
export class AccessTokenCookieAuthGuard implements CanActivate {
  constructor(
    private readonly validateSessionService: ValidateSessionService,
    private readonly securityEvent: SecurityEventService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req =
      context.switchToHttp().getRequest<Request>();

    try {
      // =========================================================
      // 1) Read access token from cookie
      // =========================================================
      const cookieToken =
        req.cookies?.['phl_access'];

      if (!cookieToken) {
        // ---- Security Event: missing access cookie ----
        this.securityEvent.log({
          type: 'auth.session.missing',
          severity: 'warning',
          meta: {
            path: req.originalUrl || req.url,
            hasCookieHeader: Boolean(
              req.headers?.cookie,
            ),
          },
        });

        throw new UnauthorizedException(
          'Access token cookie is missing',
        );
      }

      // =========================================================
      // 2) Validate JWT + Redis session (Backend authority)
      // =========================================================
      const sessionUser =
        await this.validateSessionService.validateAccessTokenFromRequest(
          req,
        );

      // =========================================================
      // 3) Attach user to request (single source of truth)
      // =========================================================
      (req as any).user = sessionUser;

      // IMPORTANT:
      // - Guard must be READ-ONLY
      // - Do NOT update session state here
      // - No Redis write, no TTL mutation

      return true;
    } catch (err: any) {
      // =========================================================
      // Security Event Classification (no secrets)
      // =========================================================

      let reason = 'unauthorized';

      if (typeof err?.message === 'string') {
        const msg =
          err.message.toLowerCase();

        if (msg.includes('jwt')) {
          reason = 'jwt_invalid_or_expired';
        } else if (msg.includes('session')) {
          reason = 'redis_session_invalid';
        }
      }

      // ---- Centralized Security Event ----
      try {
        this.securityEvent.log({
          type: 'auth.jwt.invalid',
          severity: 'warning',
          meta: {
            path: req.originalUrl || req.url,
            reason,
            hasCookieHeader: Boolean(
              req.headers?.cookie,
            ),
          },
        });
      } catch {
        // must never block auth flow
      }

      // IMPORTANT:
      // - Do NOT leak internal reason to client
      // - Always return generic Unauthorized
      throw new UnauthorizedException(
        'Unauthorized',
      );
    }
  }
}
