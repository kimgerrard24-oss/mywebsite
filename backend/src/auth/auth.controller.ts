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
import axios from 'axios';

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
    } catch (err: any) {
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
    } catch (e: any) {
      this.logger.warn(
        `[googleAuth] failed to preserve origin: ${e?.message}`,
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
      } catch (e: any) {
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
  // FACEBOOK OAuth Start (MANUAL)
  // =======================================
  @Get('facebook')
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const redirectUri: string = process.env.FACEBOOK_CALLBACK_URL || '';

      const qOrigin = (req.query?.origin as string) || '';
      const referer = (req.headers?.referer as string) || '';
      const fallback =
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://phlyphant.com';

      const oauthOrigin = (qOrigin || referer || fallback).toString();
      (req as any).oauthOrigin = oauthOrigin;

      const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=code&scope=email,public_profile&state=123`;

      this.logger.log(`[facebookAuth] redirecting to: ${authUrl}`);
      return res.redirect(authUrl);
    } catch (e: any) {
      this.logger.error(`[facebookAuth] error: ${e.message}`);
      return res.status(500).send('Facebook auth start error');
    }
  }

  // =======================================
  // FACEBOOK OAuth Callback (MANUAL)
  // =======================================
  @Get('facebook/callback')
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const { code } = req.query;

      if (!code) {
        this.logger.warn('[facebookCallback] missing code');
        return res.status(400).send('Missing code');
      }

      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';
      const redirectUri: string = process.env.FACEBOOK_CALLBACK_URL || '';

      // 1) แลก code -> access_token
      const tokenRes = await axios.get(
        'https://graph.facebook.com/v12.0/oauth/access_token',
        {
          params: {
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
          },
        },
      );

      const accessToken = tokenRes.data.access_token;

      // 2) ดึงข้อมูลผู้ใช้
      const profileRes = await axios.get(
        'https://graph.facebook.com/me',
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,email,picture',
          },
        },
      );

      const profile = profileRes.data;

      // 3) หา Firebase UID
      const firebaseUid = await this.auth.getOrCreateOAuthUser(
        'facebook',
        profile.id,
        profile.email,
        profile.name,
        profile.picture?.data?.url,
      );

      // 4) สร้าง custom token
      const customToken = await this.auth.createFirebaseCustomToken(
        firebaseUid,
        profile,
      );

      let origin =
        (req as any).oauthOrigin ||
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://phlyphant.com';

      try {
        const parsed = new URL(origin);
        origin = parsed.origin;
      } catch (e: any) {
        origin = origin.replace(/\/.*$/, '');
      }
      origin = origin.replace(/\/+$/, '');

      const redirectTo = `${origin}/auth/complete?customToken=${encodeURIComponent(
        customToken,
      )}`;

      this.logger.log(`[facebookCallback] redirect=${redirectTo}`);
      return res.redirect(302, redirectTo);
    } catch (err: any) {
      this.logger.error(
        `[facebookCallback] error: ${err?.message || err}`,
      );
      return res.status(500).send('Facebook callback error');
    }
  }

  // ==================================================
  // SESSION COOKIE + LOGOUT + CHECK
  // ==================================================
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
    } catch (err: any) {
      return res.status(401).json({ message: 'Invalid ID token' });
    }
  }

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
        } catch (e: any) {}
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
    } catch (e: any) {
      return res.status(500).json({ success: false });
    }
  }

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
    } catch (e: any) {
      return {
        sessionCookie: false,
        firebaseAdmin: false,
        oauth: false,
        websocket: false,
      };
    }
  }
}
