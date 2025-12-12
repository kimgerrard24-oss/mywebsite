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
      this.authLogger.logJwtInvalid('missing_token', 'No access token provided');
      throw new UnauthorizedException('Missing access token');
    }

    try {
      // Verify JWT + Redis session (payload = { sub, jti })
      const payload = await this.authService.verifyAccessToken(token);

      if (!payload?.sub || !payload?.jti) {
        this.authLogger.logJwtInvalid('invalid_payload', 'Invalid token payload');
        throw new UnauthorizedException('Invalid token payload');
      }

      // Attach user info for request.user
      (req as any).user = {
        userId: payload.sub,
        jti: payload.jti,
      };

      return true;
    } catch (err: any) {
      this.authLogger.logJwtInvalid(
        'verification_failed',
        err?.message ?? 'invalid_jwt',
      );
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(req: Request): string | null {
    const cookieName = process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access';
    const raw = req.cookies?.[cookieName];

    if (raw && typeof raw === 'string') {
      return raw.trim();
    }
    return null;
  }
}



