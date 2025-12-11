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
      // =====================================================
      // Decode Base64URL access token, then overwrite cookie
      // =====================================================
      const encoded = req.cookies?.['phl_access'];

      if (encoded && typeof encoded === 'string') {
        const decoded = this.decodeBase64Url(encoded);
        if (decoded) {
          req.cookies['phl_access'] = decoded;
        }
      }

      // validateSessionService expects ONLY req
      const sessionUser =
        await this.validateSessionService.validateAccessTokenFromRequest(req);

      (req as any).user = sessionUser;

      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
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
