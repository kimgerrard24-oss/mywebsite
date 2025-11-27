// ==============================
// file: src/auth/firebase-auth.guard.ts
// ==============================
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase.service';
import * as cookie from 'cookie';
import type { Request } from 'express';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private firebase: FirebaseAdminService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request & Record<string, any>>();

    const cookieName = process.env.SESSION_COOKIE_NAME || 'session';

    let url: string = String(req.originalUrl || req.url || '');
    url = url.toLowerCase();

    url = url.replace(/\/+/g, '/');
    url = url.replace(/^\/api\/v\d+\//, '/');
    url = url.replace(/^\/v\d+\//, '/');

    const publicPrefixes = [
      '/auth/google',
      '/auth/google/callback',
      '/auth/google/redirect',
      '/auth/facebook',
      '/auth/facebook/callback',
      '/auth/facebook/redirect',
      '/auth/session',
      '/auth/logout',
      '/auth/config',
      '/auth/complete',

      '/api/auth/google',
      '/api/auth/google/callback',
      '/api/auth/google/redirect',
      '/api/auth/facebook',
      '/api/auth/facebook/callback',
      '/api/auth/facebook/redirect',
      '/api/auth/session',
      '/api/auth/logout',
      '/api/auth/config',
      '/api/auth/complete',

      '/auth/firebase',
      '/api/auth/firebase',
    ];

    if (publicPrefixes.some((path) => url.startsWith(path))) {
      return true;
    }

    let sessionCookieValue: string | null = null;

    try {
      if ((req as any).cookies && (req as any).cookies[cookieName]) {
        sessionCookieValue = (req as any).cookies[cookieName];
      }

      if (!sessionCookieValue && typeof req.headers.cookie === 'string') {
        const parsed = cookie.parse(req.headers.cookie);
        sessionCookieValue = parsed[cookieName] || null;
      }
    } catch (error: unknown) {
      const err =
        error instanceof Error ? error.message : String(error);

      this.logger.warn('Cookie parse failed: ' + err);
    }

    const authHeader =
      (req.headers && (req.headers.authorization as string)) || '';

    try {
      if (sessionCookieValue) {
        const decoded = await this.firebase
          .auth()
          .verifySessionCookie(sessionCookieValue, false);

        req.user = decoded;
        return true;
      }

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();

        if (token) {
          const decoded = await this.firebase.auth().verifyIdToken(token);
          req.user = decoded;
          return true;
        }
      }
    } catch (error: unknown) {
      const err =
        error instanceof Error ? error.message : String(error);

      this.logger.debug('Token verification failed: ' + err);
    }

    const upgradeHeader =
      req.headers['upgrade'] ||
      req.headers['Upgrade'] ||
      req.headers['connection'];

    if (
      (typeof upgradeHeader === 'string' &&
        upgradeHeader.toLowerCase().includes('upgrade')) ||
      req.headers['sec-websocket-key'] ||
      req.headers['sec-websocket-version']
    ) {
      delete req.user;
      return true;
    }

    throw new UnauthorizedException('Authentication required');
  }
}
