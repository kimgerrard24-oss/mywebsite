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
    private readonly authService: AuthService,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request & Record<string, any>>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const rawUrl = req.originalUrl || req.url || '';
    const url = rawUrl.split('?')[0].toLowerCase();

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

    const localPrefixes = ['/auth/local', '/api/auth/local'];
    for (const p of localPrefixes) {
      if (url === p || url.startsWith(p + '/')) return true;
    }
    for (const p of publicPrefixes) {
      if (url === p || url.startsWith(p + '/')) return true;
    }

    // ============================================
    // FIX 1 — Use raw JWT token from cookie directly (no decoding)
    // ============================================
 const encodedToken = req.cookies?.['phl_access'];
if (encodedToken) {
  try {
    const decoded = await this.authService.verifyAccessToken(encodedToken);
    req.user = {
      userId: decoded.sub,
      jti: decoded.jti,      // ✅ เพิ่ม jti ตรงนี้ (สำคัญมาก)
    };
    return true;
  } catch (err) {
    this.logger.debug(
      'JWT access cookie verification failed: ' + String(err),
    );
  }
}

    // ============================================
    // Firebase session cookie fallback
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
      this.logger.debug(
        'Firebase token verification failed: ' + String(error),
      );
    }

    // Allow websocket handshake
    const isUpgrade =
      (req.headers.upgrade &&
        String(req.headers.upgrade).toLowerCase() === 'websocket') ||
      (req.headers.connection &&
        String(req.headers.connection).toLowerCase().includes('upgrade'));

    if (isUpgrade) return true;

    throw new UnauthorizedException('Authentication required');
  }

  private decodeBase64UrlToken(encoded: string): string | null {
    // No longer needed because we are using raw JWT directly
    return null;
  }
}
