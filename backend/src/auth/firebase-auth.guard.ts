// ==============================================
// file: src/auth/firebase-auth.guard.ts
// ==============================================

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseAdminService } from '../firebase/firebase.service';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import * as cookie from 'cookie';
import type { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebase: FirebaseAdminService,
    private readonly reflector: Reflector,
    private readonly authService: AuthService, // <<=== เพิ่มตรงนี้
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request & Record<string, any>>();

    // ============================================
    // 1) Public decorator
    // ============================================
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    // ============================================
    // 2) Normalize URL
    // ============================================
    const rawUrl = req.originalUrl || req.url || '';
    const url = rawUrl.split('?')[0].toLowerCase();

    // ============================================
    // 3) Public prefixes for Firebase
    // ============================================
    const publicPrefixes = [
      '/auth/local/google',
      '/auth/local/google/callback',
      '/auth/local/facebook',
      '/auth/local/facebook/callback',
      '/auth/local/complete',
      '/auth/local/firebase',
      '/auth/local/session',

      '/api/auth/local/google',
      '/api/auth/local/google/callback',
      '/api/auth/local/facebook',
      '/api/auth/local/facebook/callback',
      '/api/auth/local/complete',
      '/api/auth/local/firebase',
      '/api/auth/local/session',

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
    ];

    // ============================================
    // 4) Allow local auth routes (handled by AuthGuard)
    // ============================================
    const localPrefixes = ['/auth/local', '/api/auth/local'];
    for (const p of localPrefixes) {
      if (url === p || url.startsWith(p + '/')) {
        return true;
      }
    }

    for (const p of publicPrefixes) {
      if (url === p || url.startsWith(p + '/')) return true;
    }

    // ============================================
    // 5) NEW — Handle JWT Access Token (phl_access)
    // ============================================
    const accessCookie = req.cookies?.['phl_access'];
    if (accessCookie) {
      try {
        const decoded = await this.authService.verifyAccessToken(accessCookie);
        req.user = { userId: decoded.sub };
        return true;
      } catch (err) {
        this.logger.debug('JWT access cookie verification failed: ' + String(err));
      }
    }

    // ============================================
    // 6) Try Firebase session cookie
    // ============================================
    const cookieName = process.env.SESSION_COOKIE_NAME || '__session';
    let sessionCookieValue: string | null = null;

    try {
      if (req.cookies && req.cookies[cookieName]) {
        sessionCookieValue = req.cookies[cookieName];
      } else if (typeof req.headers.cookie === 'string') {
        const parsed = cookie.parse(req.headers.cookie);
        sessionCookieValue = parsed[cookieName] || null;
      }
    } catch (error) {
      this.logger.warn('Cookie parse failed: ' + String(error));
    }

    const authHeader = (req.headers?.authorization as string) || '';

    try {
      if (sessionCookieValue) {
        const decoded = await this.firebase
          .auth()
          .verifySessionCookie(sessionCookieValue, false);

        req.user = decoded;
        return true;
      }

      // Firebase Bearer token
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token) {
          const decoded = await this.firebase.auth().verifyIdToken(token);
          req.user = decoded;
          return true;
        }
      }
    } catch (error) {
      this.logger.debug('Firebase token verification failed: ' + String(error));
    }

    // ============================================
    // 7) Allow WebSocket upgrade
    // ============================================
    const isUpgrade =
      (req.headers.upgrade &&
        String(req.headers.upgrade).toLowerCase() === 'websocket') ||
      (req.headers.connection &&
        String(req.headers.connection).toLowerCase().includes('upgrade'));

    if (isUpgrade) return true;

    throw new UnauthorizedException('Authentication required');
  }
}
