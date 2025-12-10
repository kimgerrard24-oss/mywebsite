// file: src/auth/jwt-auth.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as Sentry from '@sentry/node';
import { AuthLoggerService } from '../common/logging/auth-logger.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authLogger: AuthLoggerService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const verifyOptions: jwt.VerifyOptions = {
      algorithms: ['HS256'],
      ignoreExpiration: false,
    };

    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string,
        verifyOptions,
      );

      req.user = decoded;
      return true;

    } catch (err: any) {
      const jti = this.extractTokenId(token);

      this.authLogger.logJwtInvalid(
        jti ?? 'unknown',
        err?.message ?? 'invalid_jwt',
      );

      if (err?.name !== 'TokenExpiredError') {
        Sentry.captureException(err);
      }

      throw new UnauthorizedException('Invalid token');
    }
  }

  handleRequest(err: any, user: any): any {
    if (err || !user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }

  private extractToken(req: Request): string | null {
    const header = req.headers['authorization'];
    if (header && !Array.isArray(header)) {
      const parts = header.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1].trim();
      }
    }

    const cookie = req.cookies?.['phl_access'];
    if (cookie && typeof cookie === 'string') {
      return cookie.trim();
    }

    return null;
  }

  private extractTokenId(token: string): string | null {
    try {
      const payload = jwt.decode(token) as any;
      return payload?.jti ?? null;
    } catch {
      return null;
    }
  }
}

