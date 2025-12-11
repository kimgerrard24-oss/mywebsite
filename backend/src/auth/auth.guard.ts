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
  user?: { userId: string };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly validateSessionService: ValidateSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic === true) {
      return true;
    }

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      // ================================================
      // Use raw JWT cookie without Base64URL decoding
      // ================================================
      const accessToken = req.cookies?.['phl_access'];

      if (!accessToken) {
        throw new UnauthorizedException('Authentication required');
      }

      // Validate the JWT token directly from cookie
      const sessionUser = await this.validateSessionService.validateAccessTokenFromRequest(req);

      req.user = { userId: sessionUser.userId };

      return true;
    } catch {
      throw new UnauthorizedException('Authentication required');
    }
  }
}

