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
import { Public } from './decorators/public.decorator';
import * as cookie from 'cookie';
import type { Request } from 'express';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebase: FirebaseAdminService,
    private readonly reflector: Reflector,               // FIX: add reflector
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request & Record<string, any>>();

    // ============================================
    // 1) FIX — allow @Public() to bypass guard
    // ============================================
    const isPublic = this.reflector.getAllAndOverride<boolean>(Public, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // ============================================
    // 2) FIX — allow health/system-check without login
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

      // เดิม
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

      // api prefix
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
    // 3) Session cookie authentication (unchanged)
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
      // Firebase session cookie
      if (sessionCookieValue) {
        const decoded = await this.firebase
          .auth()
          .verifySessionCookie(sessionCookieValue, false);

        req.user = decoded;
        return true;
      }

      // Firebase bearer token
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
    // 4) Allow websocket upgrade traffic
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
    // 5) Default = Unauthorized
    // ============================================
    throw new UnauthorizedException('Authentication required');
  }
}
