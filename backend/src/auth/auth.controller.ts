// ==============================
// file: src/auth/auth.controller.ts
// ==============================
import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import IORedis from 'ioredis';
import * as admin from 'firebase-admin';

const redis = new IORedis(process.env.REDIS_URL || 'redis://redis:6379', {
  maxRetriesPerRequest: 3,
});

function normalizeRedirectUri(raw: string): string {
  if (!raw) return raw;
  let s = raw.trim();
  s = s.replace(/\?{2,}/g, '');
  s = s.replace(/([^:]\/)\/+/g, '$1');
  return s;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly auth: AuthService) {}

  // =======================================
  // GOOGLE OAuth Start
  // =======================================
  @Get('google')
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      const stateKey = `oauth_state_${state}`;

      await redis.setex(stateKey, 300, '1');

      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        domain: process.env.COOKIE_DOMAIN || '.phlyphant.com',
        path: '/',
        maxAge: 5 * 60 * 1000,
      });

      const clientId = process.env.GOOGLE_CLIENT_ID || '';
      const redirectUri = normalizeRedirectUri(
        process.env.GOOGLE_CALLBACK_URL ||
          process.env.GOOGLE_REDIRECT_URL ||
          '',
      );

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        prompt: 'select_account',
      });

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      this.logger.log(`[googleAuth] redirect=${authUrl}`);
      return res.redirect(authUrl);
    } catch (e: any) {
      this.logger.error('[googleAuth] error: ' + e.message);
      return res.status(500).send('Google auth error');
    }
  }

  // =======================================
  // GOOGLE OAuth Callback
  // =======================================
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const returnedState = req.query.state as string;

      if (!code || !returnedState) {
        return res.status(400).send('Missing code or state');
      }

      const storedStateCookie = req.cookies?.oauth_state || null;
      const redisKey = `oauth_state_${returnedState}`;
      const redisState = await redis.get(redisKey);

      let validState = false;

      if (redisState === '1') {
        validState = true;
        await redis.del(redisKey).catch(() => {});
      } else if (storedStateCookie && storedStateCookie === returnedState) {
        validState = true;
      }

      if (!validState) {
        this.logger.warn(
          `[googleCallback] state mismatch returned=${returnedState} cookie=${storedStateCookie} redis=${redisState}`,
        );
        return res.status(400).send('Invalid or expired state');
      }

      res.clearCookie('oauth_state', {
        domain: process.env.COOKIE_DOMAIN || '.phlyphant.com',
        path: '/',
      });

      const tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: normalizeRedirectUri(
            process.env.GOOGLE_CALLBACK_URL ||
              process.env.GOOGLE_REDIRECT_URL ||
              '',
          ),
          grant_type: 'authorization_code',
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const accessToken = tokenRes.data.access_token;

      const infoRes = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const profile = infoRes.data;

      const firebaseUid =
        profile.sub ||
        profile.id ||
        `google:${profile.email || crypto.randomUUID()}`;

      const customToken = await this.auth.createFirebaseCustomToken(
        firebaseUid,
        profile,
      );

      const redirectBase =
        process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://www.phlyphant.com';

      const finalUrl =
        `${redirectBase}/auth/complete?customToken=${encodeURIComponent(
          customToken,
        )}`;

      this.logger.log(`[googleCallback] redirect=${finalUrl}`);
      return res.redirect(finalUrl);
    } catch (err: any) {
      this.logger.error('[googleCallback] error: ' + err.message);
      return res.status(500).send('Authentication error');
    }
  }

  // =======================================
  // FACEBOOK OAuth Start
  // =======================================
  @Get('facebook')
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      const stateKey = `oauth_state_${state}`;
      await redis.setex(stateKey, 300, '1');

      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        domain: process.env.COOKIE_DOMAIN || '.phlyphant.com',
        path: '/',
        maxAge: 5 * 60 * 1000,
      });

      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const redirectUri = normalizeRedirectUri(
        process.env.FACEBOOK_CALLBACK_URL || '',
      );

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'email,public_profile',
        state,
      });

      const authUrl =
        `https://www.facebook.com/v12.0/dialog/oauth?${params.toString()}`;

      this.logger.log(`[facebookAuth] redirect=${authUrl}`);
      return res.redirect(authUrl);
    } catch (e: any) {
      this.logger.error('[facebookAuth] error: ' + e.message);
      return res.status(500).send('Facebook auth error');
    }
  }

  // =======================================
  // FACEBOOK Callback
  // =======================================
  @Get('facebook/callback')
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const returnedState = req.query.state as string;

      if (!code || !returnedState) {
        return res.status(400).send('Missing code or state');
      }

      const storedStateCookie = req.cookies?.oauth_state || null;
      const redisKey = `oauth_state_${returnedState}`;
      const redisState = await redis.get(redisKey);

      let validState = false;

      if (redisState === '1') {
        validState = true;
        await redis.del(redisKey).catch(() => {});
      } else if (storedStateCookie && storedStateCookie === returnedState) {
        validState = true;
      }

      if (!validState) {
        return res.status(400).send('Invalid or expired state');
      }

      res.clearCookie('oauth_state', {
        domain: process.env.COOKIE_DOMAIN || '.phlyphant.com',
        path: '/',
      });

      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';
      const redirectUri = normalizeRedirectUri(
        process.env.FACEBOOK_CALLBACK_URL || '',
      );

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

      const firebaseUid = await this.auth.getOrCreateOAuthUser(
        'facebook',
        profile.id,
        profile.email,
        profile.name,
        profile.picture?.data?.url,
      );

      const customToken = await this.auth.createFirebaseCustomToken(
        firebaseUid,
        profile,
      );

      const redirectBase =
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://www.phlyphant.com';

      const finalUrl =
        `${redirectBase}/auth/complete?customToken=${encodeURIComponent(
          customToken,
        )}`;

      this.logger.log(`[facebookCallback] redirect=${finalUrl}`);
      return res.redirect(finalUrl);
    } catch (err: any) {
      this.logger.error('[facebookCallback] error: ' + err.message);
      return res.status(500).send('Facebook callback error');
    }
  }

  // =======================================
  // CREATE SESSION COOKIE AFTER /auth/complete
  //
  // Important: frontend must exchange the customToken (from query)
  // with Firebase client SDK (signInWithCustomToken) to obtain an
  // ID token, then POST { idToken } to this endpoint. Server must
  // create a session cookie from the ID token (not from a custom token).
  // =======================================
  @Post('complete')
  async complete(@Body() body: any, @Res() res: Response) {
    const idToken = body?.idToken as string | undefined;

    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    try {
      const expiresIn = Number(process.env.SESSION_COOKIE_MAX_AGE_MS || 432000000); // 5 days

      const sessionCookie = await admin.auth().createSessionCookie(idToken, {
        expiresIn,
      });

      const cookieName = process.env.SESSION_COOKIE_NAME || '__session';
      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';
      const isProd = process.env.NODE_ENV === 'production';

      res.cookie(cookieName, sessionCookie, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'none',
        domain: cookieDomain,
        path: '/',
        maxAge: expiresIn,
      });

      return res.json({ ok: true });
    } catch (e: any) {
      this.logger.error('[complete] session cookie error: ' + String(e));
      return res.status(500).json({ error: 'create_session_failed', detail: e?.message });
    }
  }

  // =======================================
  // SESSION CHECK
  // =======================================
  @Get('session-check')
  async sessionCheck(@Req() req: Request, @Res() res: Response) {
    const cookie = req.cookies?.__session || req.cookies?.[process.env.SESSION_COOKIE_NAME || '__session'];

    if (!cookie) {
      return res.status(401).json({ valid: false });
    }

    try {
      const decoded = await admin.auth().verifySessionCookie(cookie, true);
      return res.json({ valid: true, decoded });
    } catch (e: any) {
      this.logger.warn('[session-check] invalid session: ' + String(e));
      return res.status(401).json({ valid: false });
    }
  }
}
