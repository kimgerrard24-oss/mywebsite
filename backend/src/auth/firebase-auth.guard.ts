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
    // 1) Public Decorator — allow bypass
    // ============================================
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // ============================================
    // 2) Safe normalize URL (remove query)
    // ============================================
    const rawUrl = req.originalUrl || req.url || '';
    const url = rawUrl.split('?')[0].toLowerCase();

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

      '/auth/local/google',
      '/auth/local/google/callback',
      '/auth/local/google/redirect',
      '/auth/localfacebook',
      '/auth/local/facebook/callback',
      '/auth/local/facebook/redirect',
      '/auth/local/session',
      '/auth/local/logout',
      '/auth/local/config',
      '/auth/local/complete',
      '/auth/local/firebase',

      '/api/auth/local/google',
      '/api/auth/local/google/callback',
      '/api/auth/local/facebook',
      '/api/auth/local/facebook/callback',
      '/api/auth/local/complete',
      '/api/auth/localfirebase',
    ];

    if (publicPrefixes.some((p) => url.startsWith(p))) {
      return true;
    }

    // ============================================
    // 3) Authenticate: Session Cookie OR Bearer token
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
      this.logger.debug('Token verification failed: ' + String(error));
    }

    // ============================================
    // 4) Allow WebSocket Upgrade
    // ============================================
    const isWebsocketUpgrade =
      (req.headers.upgrade &&
        String(req.headers.upgrade).toLowerCase() === 'websocket') ||
      (req.headers.connection &&
        String(req.headers.connection).toLowerCase().includes('upgrade')) ||
      req.headers['sec-websocket-key'];

    if (isWebsocketUpgrade) {
      return true;
    }

    throw new UnauthorizedException('Authentication required');
  }
}
