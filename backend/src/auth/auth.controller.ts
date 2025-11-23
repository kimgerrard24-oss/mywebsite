// ==============================
// file: src/auth/auth.controller.ts
// ==============================
import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Post,
  Body,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import * as cookie from 'cookie';
import passport from 'passport'; // <-- required for programmatic callback

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly auth: AuthService) {}

  // =======================================
  // CONFIG (Google only)
  // =======================================
  @Get('config')
  async getConfig() {
    try {
      const cfg = await this.auth.getGoogleConfig();

      const safeRedirectUri = cfg.redirectUri
        .replace('/api/auth', '/auth')
        .replace('/api/', '/');

      return {
        status: 'ok',
        google: {
          clientId: cfg.clientId,
          redirectUri: safeRedirectUri,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  // =======================================
  // GOOGLE OAuth Start
  // =======================================
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    try {
      const qOrigin = (req.query?.origin as string) || '';
      const referer = (req.headers?.referer as string) || '';
      const envFallback =
        process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN || '';

      const oauthOrigin = (qOrigin || referer || envFallback).toString();
      if (oauthOrigin) (req as any).oauthOrigin = oauthOrigin;

      this.logger.log(`[googleAuth] preserved origin=${oauthOrigin}`);
    } catch (e) {
      this.logger.warn(
        `[googleAuth] failed to preserve origin: ${(e as Error).message}`,
      );
    }
  }

  // =======================================
  // GOOGLE OAuth Callback
  // =======================================
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;

      if (!user?.firebaseUid) {
        this.logger.warn('[googleCallback] user missing firebaseUid');
        return res.status(500).send('Authentication failed');
      }

      const customToken = await this.auth.createFirebaseCustomToken(
        user.firebaseUid,
        user,
      );

      if (!customToken) {
        this.logger.warn('[googleCallback] failed to create custom token');
        return res.status(500).send('Authentication failed');
      }

      let origin =
        (req as any).resolvedOrigin ||
        (req as any).oauthOrigin ||
        process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://phlyphant.com';

      try {
        const parsed = new URL(origin);
        origin = parsed.origin;
      } catch {
        origin = origin.replace(/\/.*$/, '');
      }

      origin = origin.replace(/\/+$/, '');

      const redirectTo = `${origin}/auth/complete?customToken=${encodeURIComponent(
        customToken,
      )}`;

      this.logger.log(`[googleCallback] redirect=${redirectTo}`);
      return res.redirect(302, redirectTo);
    } catch (err: any) {
      this.logger.error(
        `[googleCallback] error: ${err?.message || String(err)}`,
      );
      return res.status(500).send('Authentication error');
    }
  }

  // =======================================
  // FACEBOOK OAuth Start
  // =======================================
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req: Request) {
    try {
      const qOrigin = (req.query?.origin as string) || '';
      const referer = (req.headers?.referer as string) || '';
      const fallback =
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://phlyphant.com';

      const oauthOrigin = (qOrigin || referer || fallback).toString();
      if (oauthOrigin) (req as any).oauthOrigin = oauthOrigin;

      this.logger.log(`[facebookAuth] preserved origin=${oauthOrigin}`);
    } catch (e) {
      this.logger.warn(
        `[facebookAuth] preserve origin error: ${(e as Error).message}`,
      );
    }
  }

  // =======================================
  // FACEBOOK OAuth Callback (NEW FIXED VERSION)
  // =======================================
  @Get('facebook/callback')
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const query = req.query || {};

      this.logger.log(
        `[facebookCallback] incomingQuery=${JSON.stringify(query)}`,
      );

      // If missing code or state → show clear error instead of passport internal error
      if (!query.code || !query.state) {
        this.logger.warn(
          `[facebookCallback] Missing code or state. Query=${JSON.stringify(
            query,
          )}`,
        );
        return res
          .status(400)
          .send('Missing code or state in Facebook OAuth callback.');
      }

      // Handle via passport programmatically
      return passport.authenticate(
        'facebook',
        { session: false },
        async (err: any, user: any, info: any) => {
          try {
            if (err) {
              this.logger.error(
                `[facebookCallback] passport error: ${err?.message || err}`,
              );
              return res.status(500).send('Authentication failed');
            }

            if (!user) {
              this.logger.warn(
                `[facebookCallback] No user returned. info=${JSON.stringify(
                  info,
                )}`,
              );
              return res.status(401).send('Authentication failed');
            }

            if (!user?.firebaseUid) {
              this.logger.warn('[facebookCallback] missing firebaseUid');
              return res.status(500).send('Authentication failed');
            }

            const customToken = await this.auth.createFirebaseCustomToken(
              user.firebaseUid,
              user,
            );

            if (!customToken) {
              this.logger.warn('[facebookCallback] customToken creation failed');
              return res.status(500).send('Authentication failed');
            }

            let origin =
              (req as any).resolvedOrigin ||
              (req as any).oauthOrigin ||
              process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
              'https://phlyphant.com';

            try {
              const parsed = new URL(origin);
              origin = parsed.origin;
            } catch {
              origin = origin.replace(/\/.*$/, '');
            }
            origin = origin.replace(/\/+$/, '');

            const redirectTo = `${origin}/auth/complete?customToken=${encodeURIComponent(
              customToken,
            )}`;

            this.logger.log(`[facebookCallback] redirect=${redirectTo}`);
            return res.redirect(302, redirectTo);
          } catch (innerErr: any) {
            this.logger.error(
              `[facebookCallback] inner error: ${
                innerErr?.message || innerErr
              }`,
            );
            return res.status(500).send('Authentication error');
          }
        },
      )(req as any, res as any);
    } catch (err: any) {
      this.logger.error(
        `[facebookCallback] outer error: ${err?.message || String(err)}`,
      );
      return res.status(500).send('Authentication error');
    }
  }

  // =======================================
  // Create Firebase Session Cookie
  // =======================================
  @Post('session')
  async createSession(@Body('idToken') idToken: string, @Res() res: Response) {
    if (!idToken) return res.status(400).json({ message: 'idToken required' });

    try {
      const decoded = await this.auth.verifyIdToken(idToken);

      const expiresIn = Number(
        process.env.SESSION_COOKIE_MAX_AGE_MS || '432000000',
      );

      const sessionCookie = await this.auth.createSessionCookie(
        idToken,
        expiresIn,
      );

      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

      res.cookie(process.env.SESSION_COOKIE_NAME || 'session', sessionCookie, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: expiresIn,
        path: '/',
        domain: cookieDomain,
      });

      return res.json({ uid: decoded.uid, email: decoded.email });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid ID token' });
    }
  }

  // =======================================
  // Logout
  // =======================================
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const name = process.env.SESSION_COOKIE_NAME || 'session';

      const raw = req.headers.cookie || '';
      const parsed = cookie.parse(raw);
      const session = parsed[name];

      if (session) {
        try {
          const decoded = await this.auth.verifySessionCookie(session);
          if (decoded?.uid) await this.auth.revoke(decoded.uid);
        } catch {}
      }

      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

      res.clearCookie(name, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        domain: cookieDomain,
      });

      return res.json({ success: true });
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  // =======================================
  // Session Check
  // =======================================
  @Get('session-check')
  async sessionCheck(@Req() req: Request) {
    try {
      const raw = req.headers.cookie || '';
      const parsed = cookie.parse(raw);

      const sessionCookie =
        parsed[process.env.SESSION_COOKIE_NAME || 'session'];

      if (!sessionCookie) {
        return {
          sessionCookie: false,
          firebaseAdmin: false,
          oauth: false,
          websocket: false,
        };
      }

      const decoded = await this.auth.verifySessionCookie(sessionCookie);

      return {
        sessionCookie: true,
        firebaseAdmin: true,
        oauth: !!decoded?.email,
        websocket: true,
      };
    } catch {
      return {
        sessionCookie: false,
        firebaseAdmin: false,
        oauth: false,
        websocket: false,
      };
    }
  }
}
