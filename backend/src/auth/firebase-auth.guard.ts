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
import { Reflector } from '@nestjs/core';
import { FirebaseAdminService } from '../firebase/firebase.service';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';   // FIX: use key
import * as cookie from 'cookie';
import type { Request } from 'express';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebase: FirebaseAdminService,
    private readonly reflector: Reflector, // OK
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request & Record<string, any>>();

    // ============================================
    // 1) FIX — allow @Public() to bypass guard
    // ============================================
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // ============================================
    // 2) Allow health/system-check and OAuth routes
    // ============================================
    const url = (req.originalUrl || req.url || '').toLowerCase();

    const publicPrefixes = [
      '/system-check',
      '/health',
      '/health/',
      '/health/db',
      '/health/redis',
      '/health/info',
      '/health/secrets',
      '/health/queue',
      '/health/socket',
      '/health/r2',

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
      '/auth/firebase',

      '/api/auth/google',
      '/api/auth/google/callback',
      '/api/auth/facebook',
      '/api/auth/facebook/callback',
      '/api/auth/complete',
      '/api/auth/firebase',
    ];

    if (publicPrefixes.some((p) => url.startsWith(p))) {
      return true;
    }

    // ============================================
    // 3) Session cookie auth (unchanged)
    // ============================================
    const cookieName = process.env.SESSION_COOKIE_NAME || '__session';
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
      const err = error instanceof Error ? error.message : String(error);
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

      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();

        if (token) {
          const decoded = await this.firebase.auth().verifyIdToken(token);
          req.user = decoded;
          return true;
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : String(error);
      this.logger.debug('Token verification failed: ' + err);
    }

    // ============================================
    // 4) Allow websocket upgrade
    // ============================================
    const upgradeHeader =
      req.headers['upgrade'] ||
      req.headers['Upgrade'] ||
      req.headers['connection'];

    if (
      (typeof upgradeHeader === 'string' &&
        upgradeHeader.toLowerCase().includes('upgrade')) ||
      req.headers['sec-websocket-key']
    ) {
      delete req.user;
      return true;
    }

    // ============================================
    // 5) Default: block request
    // ============================================
    throw new UnauthorizedException('Authentication required');
  }
}
