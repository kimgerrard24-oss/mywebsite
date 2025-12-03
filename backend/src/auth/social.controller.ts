// src/auth/social.controller.ts

import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Query,
  Body,
  Logger,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import IORedis from 'ioredis';
import * as admin from 'firebase-admin';
import { AuthRateLimitGuard } from '../common/rate-limit/auth-rate-limit.guard';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { RateLimitContext } from '../common/rate-limit/rate-limit.decorator';

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

function normalizeOAuthState(raw?: string | null): string {
  if (!raw) return '';
  let s = raw.trim();

  try {
    s = decodeURIComponent(s);
  } catch {}

  s = s.replace(/\+/g, ' ');
  s = s.replace(/%2B/gi, '+');
  s = s.replace(/%3D/gi, '=');
  s = s.replace(/%2F/gi, '/');
  s = s.replace(/^["']|["']$/g, '');
  s = s.replace(/([^:]\/)\/+/g, '$1');

  return s;
}

function buildFinalUrl(base: string | undefined, customToken: string): string {
  const targetPath = '/auth/complete';
  let redirectBase = base?.trim() || 'https://www.phlyphant.com';

  redirectBase = redirectBase.replace(/\/+$/g, '');

  return `${redirectBase}${targetPath}?customToken=${encodeURIComponent(
    customToken,
  )}`;
}

@Controller('auth')
export class SocialAuthController {
  private readonly logger = new Logger(SocialAuthController.name);

  constructor(private readonly auth: AuthService) {}

  // -------------------------
  // GOOGLE AUTH START
  // -------------------------
  @RateLimit('oauth')
  @RateLimitContext('oauth')
  @UseGuards(AuthRateLimitGuard)
  @Get('google')
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

      const state = crypto.randomBytes(16).toString('hex');
      const stateKey = `oauth_state_${state}`;
      await redis.setex(stateKey, 300, '1');

      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'none',
        domain: cookieDomain,
        path: '/',
        maxAge: 5 * 60 * 1000,
      });

      const clientId = process.env.GOOGLE_CLIENT_ID || '';
      const redirectUri = normalizeRedirectUri(
        process.env.GOOGLE_CALLBACK_URL ||
          'https://api.phlyphant.com/auth/google/callback',
      );

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        prompt: 'select_account',
      });

      return res.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      );
    } catch (e: any) {
      this.logger.error('[googleAuth] error: ' + e.message);
      return res.status(500).send('Google auth error');
    }
  }

  // -------------------------
  // GOOGLE CALLBACK
  // -------------------------
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const returnedState = req.query.state as string;

      if (!code || !returnedState) {
        return res.status(400).send('Missing code or state');
      }

      const redisKey = `oauth_state_${returnedState}`;
      const redisState = await redis.get(redisKey);

      if (!redisState) return res.status(400).send('Invalid state');
      await redis.del(redisKey).catch(() => {});

      res.clearCookie('oauth_state', {
        domain: process.env.COOKIE_DOMAIN || '.phlyphant.com',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      });

      const tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri:
            process.env.GOOGLE_CALLBACK_URL ||
            'https://api.phlyphant.com/auth/google/callback',
          grant_type: 'authorization_code',
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
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
        profile.sub || profile.id || `google:${profile.email}`;

      const customToken = await this.auth.createFirebaseCustomToken(
        firebaseUid,
        profile,
      );

      const finalUrl = buildFinalUrl(
        process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN,
        customToken,
      );

      return res.redirect(finalUrl);
    } catch (err: any) {
      this.logger.error('[googleCallback] error: ' + err.message);
      return res.status(500).send('Authentication error');
    }
  }

  // -------------------------
  // FACEBOOK AUTH START
  // -------------------------
  @RateLimit('oauth')
  @RateLimitContext('oauth')
  @UseGuards(AuthRateLimitGuard)
  @Get('facebook')
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

      const state = crypto.randomBytes(16).toString('hex');
      const stateKey = `oauth_state_${state}`;
      await redis.setex(stateKey, 300, '1');

      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'none',
        domain: cookieDomain,
        path: '/',
        maxAge: 5 * 60 * 1000,
      });

      const clientId = process.env.FACEBOOK_CLIENT_ID || '';

      const redirectUri = normalizeRedirectUri(
        process.env.FACEBOOK_CALLBACK_URL ||
          `https://api.phlyphant.com/auth/facebook/callback`,
      );

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'email,public_profile',
        state,
      });

      return res.redirect(
        `https://www.facebook.com/v12.0/dialog/oauth?${params.toString()}`,
      );
    } catch (e: any) {
      this.logger.error('[facebookAuth] error: ' + e.message);
      return res.status(500).send('Facebook auth error');
    }
  }

  // -------------------------
  // FACEBOOK CALLBACK
  // -------------------------
  @Get('facebook/callback')
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const returnedStateRaw = req.query.state as string;

      if (!code || !returnedStateRaw) {
        return res.status(400).send('Missing code or state');
      }

      const returnedState = normalizeOAuthState(returnedStateRaw);
      const redisKey = `oauth_state_${returnedState}`;
      const redisState = await redis.get(redisKey);

      if (!redisState) return res.status(400).send('Invalid state');
      await redis.del(redisKey).catch(() => {});

      res.clearCookie('oauth_state', {
        domain: process.env.COOKIE_DOMAIN || '.phlyphant.com',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      });

      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';

      const redirectUri =
        process.env.FACEBOOK_CALLBACK_URL ||
        `https://api.phlyphant.com/auth/facebook/callback`;

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

      const profileRes = await axios.get('https://graph.facebook.com/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name,email,picture',
        },
      });

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

      const finalUrl = buildFinalUrl(
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN,
        customToken,
      );

      return res.redirect(finalUrl);
    } catch (err: any) {
      this.logger.error('[facebookCallback] error: ' + err.message);
      return res.status(500).send('Facebook callback error');
    }
  }

  // -------------------------
  // SESSION COOKIE CREATOR
  // -------------------------
  @Post('complete')
  async complete(@Body() body: any, @Res() res: Response) {
    const idToken = body?.idToken;

    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    try {
      const expiresIn = Number(
        process.env.SESSION_COOKIE_MAX_AGE_MS || 432000000,
      );

      const sessionCookie = await admin
        .auth()
        .createSessionCookie(idToken, { expiresIn });

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
        expires: new Date(Date.now() + expiresIn),
      });

      return res.json({ ok: true });
    } catch (e: any) {
      this.logger.error('[complete] session cookie error: ' + String(e));
      return res
        .status(500)
        .json({ error: 'create_session_failed', detail: e?.message });
    }
  }

   // SESSION CHECK
    @Get('session-check')
    async sessionCheck(@Req() req: Request, @Res() res: Response) {
      const cookie =
        req.cookies?.__session ||
        req.cookies?.[process.env.SESSION_COOKIE_NAME || '__session'];
  
      if (!cookie) {
        return res.status(401).json({ valid: false });
      }
  
      try {
        const decoded = await admin.auth().verifySessionCookie(cookie, true);
        return res.json({ valid: true, decoded });
      } catch (e: any) {
        return res.status(401).json({ valid: false });
      }
    }
}
