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
      // Decode Base64URL cookie before validate
      // ================================================
      const encoded = req.cookies?.['phl_access'];
      let jwt: string | null = null;

      if (encoded) {
        jwt = this.decodeBase64Url(encoded);
      }

      const sessionUser =
        await this.validateSessionService.validateAccessTokenFromRequest(req, jwt);

      req.user = { userId: sessionUser.userId };

      return true;
    } catch {
      throw new UnauthorizedException('Authentication required');
    }
  }

  private decodeBase64Url(encoded: string): string | null {
    try {
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      return Buffer.from(padded, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }
}
