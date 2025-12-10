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
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();

    try {
      const sessionUser = await this.validateSessionService.validateAccessTokenFromRequest(
        req,
      );

      // แนบ user เข้า request (ใช้กับ @CurrentUser)
      (req as any).user = sessionUser;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
