// src/auth/guards/access-token-cookie.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ValidateSessionService } from '../services/validate-session.service';

@Injectable()
export class AccessTokenCookieAuthGuard implements CanActivate {
  constructor(
    private readonly validateSessionService: ValidateSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    try {
      // 1) Read access token from cookie
      const cookieToken = req.cookies?.['phl_access'];
      if (!cookieToken) {
        throw new UnauthorizedException('Access token cookie is missing');
      }

      // 2) Validate JWT + Redis session
      const sessionUser =
        await this.validateSessionService.validateAccessTokenFromRequest(req);

      // 3) Attach user to request (single source of truth)
      (req as any).user = sessionUser;

      // IMPORTANT:
      // - Guard must be READ-ONLY
      // - Do NOT update session state here
      // - No Redis write, no TTL mutation

      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
