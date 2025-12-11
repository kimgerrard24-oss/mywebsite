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

    const encodedToken = this.extractToken(req);
    if (!encodedToken) {
      throw new UnauthorizedException('Missing access token');
    }

    // Base64URL decode → JWT string
    const token = this.decodeBase64UrlToken(encodedToken);
    if (!token) {
      throw new UnauthorizedException('Invalid access token format');
    }

    try {
      // Verify JWT + Redis session (jti)
      const payload = await this.authService.verifyAccessToken(token);

      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      (req as any).user = { userId: payload.sub };
      return true;
    } catch (err: any) {
      this.authLogger.logJwtInvalid('unknown', err?.message ?? 'invalid_jwt');
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

  private decodeBase64UrlToken(encoded: string): string | null {
    try {
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      return Buffer.from(padded, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }
}
