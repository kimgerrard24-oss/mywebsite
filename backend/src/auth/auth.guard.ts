// ==============================
// file: src/auth/auth.guard.ts
// ==============================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ValidateSessionService } from './services/validate-session.service';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    jti: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly validateSessionService: ValidateSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // --------------------------------------------------
    // 1) Allow public routes
    // --------------------------------------------------
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic === true) {
      return true;
    }

    // --------------------------------------------------
    // 2) Validate session via single authority
    //    (JWT + Redis handled inside service)
    // --------------------------------------------------
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req) {
      throw new UnauthorizedException('Authentication required');
    }

    const sessionUser =
      await this.validateSessionService.validateAccessTokenFromRequest(req);

    if (!sessionUser?.userId || !sessionUser?.jti) {
      throw new UnauthorizedException('Authentication required');
    }

    // --------------------------------------------------
    // 3) Attach user context for downstream usage
    // --------------------------------------------------
    req.user = {
      userId: sessionUser.userId,
      jti: sessionUser.jti,
    };

    return true;
  }
}
