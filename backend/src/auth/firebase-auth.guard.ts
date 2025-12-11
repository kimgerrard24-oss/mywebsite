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
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import * as cookie from 'cookie';
import type { Request } from 'express';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebase: FirebaseAdminService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request & Record<string, any>>();

    // ============================================
    // 1) Public Decorator
    // ============================================
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // ============================================
    // 2) Normalize URL
    // ============================================
    const rawUrl = req.originalUrl || req.url || '';
    const url = rawUrl.split('?')[0].toLowerCase();

    // ============================================
    // 3) Public prefixes (Firebase-related only)
    // ============================================
    const publicPrefixes = [
      '/auth/local/google',
      '/auth/local/google/callback',
      '/auth/local/facebook',
      '/auth/local/facebook/callback',
      '/auth/local/complete',
      '/auth/local/session',
      '/auth/local/firebase',

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

    // Firebase guard should NOT block other auth systems
    // เช่น /users/me ต้องไปใช้ AccessTokenCookieAuthGuard ไม่ใช่อันนี้
    const localAuthPrefixes = ['/auth/local', '/api/auth/local'];
    for (const p of localAuthPrefixes) {
      if (url === p || url.startsWith(p + '/')) {
        return true;
      }
    }

    for (const p of publicPrefixes) {
      if (url === p || url.startsWith(p + '/')) {
        return true;
      }
    }

    // ============================================
    // 4) Try Firebase Session Cookie
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
    // 5) WebSocket upgrade allow for handshake only
    // ============================================
    const isWebsocketUpgrade =
      (req.headers.upgrade &&
        String(req.headers.upgrade).toLowerCase() === 'websocket') ||
      (req.headers.connection &&
        String(req.headers.connection).toLowerCase().includes('upgrade'));

    if (isWebsocketUpgrade) {
      return true;
    }

    throw new UnauthorizedException('Authentication required');
  }
}
