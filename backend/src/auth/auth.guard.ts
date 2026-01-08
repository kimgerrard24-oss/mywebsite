// ==============================
// file: src/auth/auth.guard.ts
// ==============================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ValidateSessionService } from './services/validate-session.service';
import { AuditService } from './audit.service';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    jti: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly validateSessionService: ValidateSessionService,
    private readonly audit: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // --------------------------------------------------
    // 1) Allow public routes
    // --------------------------------------------------
    const isPublic =
      this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (isPublic === true) {
      return true;
    }

    // --------------------------------------------------
    // 2) Validate session via single authority
    //    (JWT + Redis handled inside service)
    // --------------------------------------------------
    const req =
      context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

    if (!req) {
      this.logger.warn(
        'Request missing in execution context',
      );
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    let sessionUser: {
      userId: string;
      jti: string;
    } | null = null;

    try {
      sessionUser =
        await this.validateSessionService.validateAccessTokenFromRequest(
          req,
        );
    } catch (err) {
      // ===============================
      // 🚨 AUTH VALIDATION ERROR
      // ===============================
      this.logger.warn(
        'validateSessionService threw error',
      );

      try {
       await this.audit.createLog({
  userId: null, // ✅ REQUIRED by schema
  action: 'auth.validate.failed',
  success: false,
  reason: 'invalid_or_missing_session',
  ip: req.ip ?? null,
  userAgent:
    typeof req.headers['user-agent'] === 'string'
      ? req.headers['user-agent']
      : null,
});

      } catch {}

      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    if (!sessionUser?.userId || !sessionUser?.jti) {
      // ===============================
      // 🚨 INVALID / MISSING SESSION
      // ===============================
      try {
       await this.audit.createLog({
  userId: null,
  action: 'auth.validate.error',
  success: false,
  reason: 'validate_service_exception',
  ip: req.ip ?? null,
  userAgent:
    typeof req.headers['user-agent'] === 'string'
      ? req.headers['user-agent']
      : null,
});

      } catch {}

      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    // --------------------------------------------------
    // 3) Attach user context for downstream usage
    // --------------------------------------------------
    req.user = {
      userId: sessionUser.userId,
      jti: sessionUser.jti,
    };

    // ===============================
    // ✅ OPTIONAL SUCCESS TRACE (low volume)
    // ===============================
    try {
      await this.audit.createLog({
        userId: sessionUser.userId,
        action: 'auth.validate.success',
        success: true,
        ip: req.ip,
      });
    } catch {}

    return true;
  }
}
