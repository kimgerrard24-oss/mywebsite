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
      // ===== Validate from Cookie =====
      const sessionUser =
        await this.validateSessionService.validateAccessTokenFromRequest(req);

      // ===== Attach to request for decorator =====
      (req as any).sessionUser = sessionUser;

      // ===== Allow request =====
      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
