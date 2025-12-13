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

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebase: FirebaseAdminService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & Record<string, any>>();

    // --------------------------------------------
    // 1) Public routes (decorator-based)
    // --------------------------------------------
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    // --------------------------------------------
    // 2) Allow specific public / infra routes
    // (OAuth callbacks, health checks, system)
    // --------------------------------------------
    const rawUrl = req.originalUrl || req.url || '';
    const url = rawUrl.split('?')[0].toLowerCase();

    const publicPrefixes = [
      '/auth/google',
      '/auth/google/callback',
      '/auth/facebook',
      '/auth/facebook/callback',
      '/auth/complete',

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

    for (const p of publicPrefixes) {
      if (url === p || url.startsWith(p + '/')) {
        return true;
      }
    }

    // --------------------------------------------
    // 3) Firebase Session Cookie (ONLY for Firebase context)
    // --------------------------------------------
    const sessionCookieName =
      process.env.SESSION_COOKIE_NAME || '__session';

    let sessionCookieValue: string | null = null;

    try {
      if (req.cookies && req.cookies[sessionCookieName]) {
        sessionCookieValue = req.cookies[sessionCookieName];
      } else if (typeof req.headers.cookie === 'string') {
        const parsed = cookie.parse(req.headers.cookie);
        sessionCookieValue = parsed[sessionCookieName] || null;
      }
    } catch (err) {
      this.logger.warn('Cookie parse failed: ' + String(err));
    }

    if (sessionCookieValue) {
      try {
        const decoded = await this.firebase
          .auth()
          .verifySessionCookie(sessionCookieValue, false);

        // Attach Firebase decoded user ONLY
        req.user = decoded;
        return true;
      } catch (err) {
        this.logger.debug(
          'Firebase session cookie verification failed: ' + String(err),
        );
      }
    }

    // --------------------------------------------
    // 4) Firebase ID Token via Authorization header
    // (Used for Firebase-only APIs / WebSocket layer)
    // --------------------------------------------
    const authHeader = req.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        try {
          const decoded = await this.firebase.auth().verifyIdToken(token);
          req.user = decoded;
          return true;
        } catch (err) {
          this.logger.debug(
            'Firebase ID token verification failed: ' + String(err),
          );
        }
      }
    }

    // --------------------------------------------
    // 5) Allow WebSocket handshake (auth later)
    // --------------------------------------------
    const isUpgrade =
      (req.headers.upgrade &&
        String(req.headers.upgrade).toLowerCase() === 'websocket') ||
      (req.headers.connection &&
        String(req.headers.connection).toLowerCase().includes('upgrade'));

    if (isUpgrade) return true;

    // --------------------------------------------
    // 6) No Firebase auth → reject
    // (JWT + Redis auth is handled by AccessTokenCookieAuthGuard ONLY)
    // --------------------------------------------
    throw new UnauthorizedException('Firebase authentication required');
  }
}
