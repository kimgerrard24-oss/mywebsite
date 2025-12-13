// src/auth/social.controller.ts

import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import IORedis from 'ioredis';

import { AuthService } from './auth.service';
import { AuthRateLimitGuard } from '../common/rate-limit/auth-rate-limit.guard';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { RateLimitContext } from '../common/rate-limit/rate-limit.decorator';

const redis = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    })
  : new IORedis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD || undefined,
      tls: process.env.REDIS_USE_TLS === 'true' ? {} : undefined,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

/* ------------------------------------------------------------------ */
/* helpers */
/* ------------------------------------------------------------------ */
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

  try {
    if (redirectBase.toLowerCase().endsWith(targetPath)) {
      redirectBase = redirectBase.slice(
        0,
        redirectBase.length - targetPath.length,
      );
      redirectBase = redirectBase.replace(/\/+$/g, '');
    }
  } catch {}

  return `${redirectBase}${targetPath}?customToken=${encodeURIComponent(
    customToken,
  )}`;
}

/* ------------------------------------------------------------------ */
/* controller */
/* ------------------------------------------------------------------ */
@Controller('auth')
export class SocialAuthController {
  private readonly logger = new Logger(SocialAuthController.name);

  constructor(private readonly auth: AuthService) {}

  /* ================================================================
   * GOOGLE
   * ================================================================ */
  @RateLimit('oauth')
  @RateLimitContext('oauth')
  @UseGuards(AuthRateLimitGuard)
  @Get('google')
  async googleAuth(@Req() _req: Request, @Res() res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

    const state = crypto.randomBytes(16).toString('hex');
    const stateKey = `oauth_state_${state}`;

    await redis.setex(stateKey, 300, '1').catch(() => {});

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      domain: cookieDomain,
      path: '/',
      maxAge: 5 * 60 * 1000,
    });

    const redirectUri = normalizeRedirectUri(
      process.env.GOOGLE_CALLBACK_URL ||
        process.env.GOOGLE_REDIRECT_URL ||
        '',
    );

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    );
  }

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
      const cookieState = req.cookies?.oauth_state;

      if (redisState !== '1' && cookieState !== returnedState) {
        return res.status(400).send('Invalid or expired state');
      }

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
          redirect_uri: normalizeRedirectUri(
            process.env.GOOGLE_CALLBACK_URL ||
              process.env.GOOGLE_REDIRECT_URL ||
              '',
          ),
          grant_type: 'authorization_code',
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const infoRes = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
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

      const finalUrl = buildFinalUrl(
        process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN ||
          'https://www.phlyphant.com',
        customToken,
      );

      return res.redirect(finalUrl);
    } catch (e: any) {
      this.logger.error('[googleCallback] ' + String(e));
      return res.status(500).send('Authentication error');
    }
  }

  /* ================================================================
   * FACEBOOK
   * ================================================================ */
  @RateLimit('oauth')
  @RateLimitContext('oauth')
  @UseGuards(AuthRateLimitGuard)
  @Get('facebook')
  async facebookAuth(@Req() _req: Request, @Res() res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

    const state = crypto.randomBytes(16).toString('hex');
    await redis.setex(`oauth_state_${state}`, 300, '1').catch(() => {});

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      domain: cookieDomain,
      path: '/',
      maxAge: 5 * 60 * 1000,
    });

    const redirectUri = normalizeRedirectUri(
      process.env.FACEBOOK_CALLBACK_URL ||
        'https://api.phlyphant.com/auth/facebook/callback',
    );

    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email,public_profile',
      state,
    });

    return res.redirect(
      `https://www.facebook.com/v12.0/dialog/oauth?${params.toString()}`,
    );
  }

  @Get('facebook/callback')
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const rawState = req.query.state as string;
      if (!code || !rawState) {
        return res.status(400).send('Missing code or state');
      }

      const state = normalizeOAuthState(rawState);
      const redisKey = `oauth_state_${state}`;
      const redisState = await redis.get(redisKey);
      const cookieState = normalizeOAuthState(req.cookies?.oauth_state);

      if (redisState !== '1' && cookieState !== state) {
        return res.status(400).send('Invalid or expired state');
      }

      await redis.del(redisKey).catch(() => {});
      res.clearCookie('oauth_state', {
        domain: process.env.COOKIE_DOMAIN || '.phlyphant.com',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      });

      const tokenRes = await axios.get(
        'https://graph.facebook.com/v12.0/oauth/access_token',
        {
          params: {
            client_id: process.env.FACEBOOK_CLIENT_ID || '',
            client_secret: process.env.FACEBOOK_CLIENT_SECRET || '',
            redirect_uri: normalizeRedirectUri(
              process.env.FACEBOOK_CALLBACK_URL ||
                'https://api.phlyphant.com/auth/facebook/callback',
            ),
            code,
          },
        },
      );

      const profileRes = await axios.get(
        'https://graph.facebook.com/me',
        {
          params: {
            access_token: tokenRes.data.access_token,
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

      const finalUrl = buildFinalUrl(
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
          'https://www.phlyphant.com',
        customToken,
      );

      return res.redirect(finalUrl);
    } catch (e: any) {
      this.logger.error('[facebookCallback] ' + String(e));
      return res.status(500).send('Facebook callback error');
    }
  }

  /* ================================================================
   * COMPLETE → HYBRID SESSION (JWT + REDIS)
   * ================================================================ */
  @Post('complete')
  async complete(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const idToken = body?.idToken as string | undefined;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    try {
      const decoded = await this.auth.verifyIdToken(idToken);
      const user = await this.auth.getUserByFirebaseUid(decoded.uid);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const session = await this.auth.createSessionToken(user.id);

      const isProd = process.env.NODE_ENV === 'production';
      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

      res.cookie(
        process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access',
        session.accessToken,
        {
          httpOnly: true,
          secure: isProd,
          sameSite: 'none',
          domain: cookieDomain,
          path: '/',
          maxAge: session.expiresIn * 1000,
        },
      );

      res.cookie(
        process.env.REFRESH_TOKEN_COOKIE_NAME || 'phl_refresh',
        session.refreshToken,
        {
          httpOnly: true,
          secure: isProd,
          sameSite: 'none',
          domain: cookieDomain,
          path: '/',
          maxAge:
            (Number(process.env.REFRESH_TOKEN_TTL_SECONDS) ||
              60 * 60 * 24 * 7) * 1000,
        },
      );

      return res.json({ ok: true });
    } catch (e: any) {
      this.logger.error('[complete] ' + String(e));
      return res.status(401).json({ error: 'social_session_failed' });
    }
  }

  /* ================================================================
   * SESSION CHECK (JWT + REDIS)
   * ================================================================ */
  @Get('session-check')
  async sessionCheck(@Req() req: Request, @Res() res: Response) {
    try {
      const payload = await this.auth.verifyAccessToken(
        req.cookies?.[
          process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access'
        ],
      );
      return res.json({ valid: true, userId: payload.sub });
    } catch {
      return res.status(401).json({ valid: false });
    }
  }
}
