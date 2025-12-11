// file: src/auth/jwt-auth.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthLoggerService } from '../common/logging/auth-logger.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly authLogger: AuthLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      // Verify JWT + Redis session (jti)
      const payload = await this.authService.verifyAccessToken(token);

      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Attach session user to request
      (req as any).user = { userId: payload.sub };

      return true;
    } catch (err: any) {
      this.authLogger.logJwtInvalid('unknown', err?.message ?? 'invalid_jwt');
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(req: Request): string | null {
    const cookieName = process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access';
    const token = req.cookies?.[cookieName];

    if (token && typeof token === 'string') {
      return token.trim();
    }

    return null;
  }
}
