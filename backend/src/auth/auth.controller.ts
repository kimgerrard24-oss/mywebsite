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
  Query,
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

function normalizeOAuthState(raw?: string | null): string {
  if (!raw) return '';
  let s = String(raw).trim();

  // Try decoding once (safe)
  try {
    s = decodeURIComponent(s);
  } catch {
    // ignore decode errors
  }

  // Normalize common encodings and artifacts
  s = s.replace(/\+/g, ' ');
  s = s.replace(/%2B/gi, '+');
  s = s.replace(/%3D/gi, '=');
  s = s.replace(/%2F/gi, '/');

  // Remove surrounding quotes if present
  s = s.replace(/^["']|["']$/g, '').trim();

  // Collapse duplicate slashes (keep protocol safe)
  s = s.replace(/([^:]\/)\/+/g, '$1');

  return s;
}

function buildFinalUrl(
  redirectBase: string | undefined,
  customToken: string,
): string {
  const targetPath = '/auth/complete';
  let base =
    (redirectBase && redirectBase.trim()) || 'https://www.phlyphant.com';

  base = base.replace(/\/+$/g, '');

  if (base.endsWith(targetPath)) {
    return `${base}?customToken=${encodeURIComponent(customToken)}`;
  }

  if (base.includes(targetPath)) {
    return `${base}?customToken=${encodeURIComponent(customToken)}`;
  }

  return `${base}${targetPath}?customToken=${encodeURIComponent(customToken)}`;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly auth: AuthService) {}
  
  // -----------------------------
  // Local Register
  // -----------------------------
  @Post('local/register')
  async localRegister(@Body() body: any) {
    const { email, password, name } = body;

    if (!email || !password) {
      return { error: 'Email and password required' };
    }

    return this.auth.registerLocal(email, password, name);
  }
  // -----------------------------
  // Local Login
  // -----------------------------
  @Post('local/login')
  async localLogin(@Body() body: any, @Res() res: Response) {
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { user, accessToken, refreshToken } = await this.auth.loginLocal(
      email,
      password,
    );

    const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';
    const isProd = process.env.NODE_ENV === 'production';

    // Access JWT
    res.cookie('local_access', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      domain: cookieDomain,
      path: '/',
      maxAge: 1000 * 60 * 15,
    });

    // Refresh JWT
    res.cookie('local_refresh', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      domain: cookieDomain,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.json({ ok: true, user });
  }
  // -----------------------------
  // Local Refresh Token
  // -----------------------------
  @Post('local/refresh')
  async localRefresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.local_refresh;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Missing refresh token' });
    }

    const { user, accessToken, refreshToken: newRT } =
      await this.auth.refreshLocalToken(refreshToken);

    const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('local_access', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      domain: cookieDomain,
      path: '/',
      maxAge: 1000 * 60 * 15,
    });

    res.cookie('local_refresh', newRT, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      domain: cookieDomain,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.json({ ok: true, user });
  }
  // -----------------------------
  // Local Logout
  // -----------------------------
  @Post('local/logout')
  async localLogout(@Res() res: Response) {
    const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

    res.clearCookie('local_access', { domain: cookieDomain, path: '/' });
    res.clearCookie('local_refresh', { domain: cookieDomain, path: '/' });

    return res.json({ ok: true });
  }
  // -----------------------------
  // Local Request Password Reset
  // -----------------------------
  @Post('local/request-password-reset')
  async localRequestReset(@Body() body: any) {
    const { email } = body;

    if (!email) {
      return { error: 'Email is required' };
    }

    return this.auth.requestPasswordResetLocal(email);
  }
  // -----------------------------
  // Local Reset Password
  // -----------------------------
  @Post('local/reset-password')
  async localResetPassword(@Body() body: any) {
    const { uid, token, newPassword } = body;

    if (!uid || !token || !newPassword) {
      return { error: 'Missing fields' };
    }

    return this.auth.resetPasswordLocal(uid, token, newPassword);
  }
  // -----------------------------
  // Local Verify Email
  // -----------------------------
  @Get('local/verify-email')
  async localVerifyEmail(
    @Query('uid') uid: string,
    @Query('token') token: string,
  ) {
    if (!uid || !token) {
      return { error: 'Missing uid or token' };
    }

    return this.auth.verifyEmailLocal(uid, token);
  }
  // =======================================
  // GOOGLE OAuth Start
  // =======================================
  @Get('google')
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

      const state = crypto.randomBytes(16).toString('hex');
      const stateKey = `oauth_state_${state}`;

      // store in redis and log result
      try {
        await redis.setex(stateKey, 300, '1');
        this.logger.log(`[googleAuth] set redis key ${stateKey}`);
      } catch (rErr) {
        this.logger.warn(`[googleAuth] redis set failed: ${String(rErr)}`);
      }

      // set cookie for cross-subdomain usage
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
        process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT_URL || '',
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

      // clear cookie with same options
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
            process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT_URL || '',
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

      const finalUrl = buildFinalUrl(redirectBase, customToken);

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
      const isProd = process.env.NODE_ENV === 'production';
      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

      const state = crypto.randomBytes(16).toString('hex');
      const stateKey = `oauth_state_${state}`;

      try {
        await redis.setex(stateKey, 300, '1');
        this.logger.log(`[facebookAuth] set redis key ${stateKey}`);
      } catch (rErr) {
        this.logger.warn(`[facebookAuth] redis set failed: ${String(rErr)}`);
      }

      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'none',
        domain: cookieDomain,
        path: '/',
        maxAge: 5 * 60 * 1000,
      });

      const clientId = process.env.FACEBOOK_CLIENT_ID || '';

      // fallback redirectUri if env missing - ensure production callback default
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
  // FACEBOOK Callback (fixed state normalization)
  // =======================================
  @Get('facebook/callback')
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const returnedStateRaw = req.query.state as string;

      if (!code || !returnedStateRaw) {
        return res.status(400).send('Missing code or state');
      }

      // Normalize forms
      const returnedState = normalizeOAuthState(returnedStateRaw);
      const storedStateCookieRaw = req.cookies?.oauth_state || null;
      const storedStateCookie = normalizeOAuthState(storedStateCookieRaw);

      // Try redis with both raw and normalized variants
      const redisKeyRaw = `oauth_state_${returnedStateRaw}`;
      const redisKeyNorm = `oauth_state_${returnedState}`;

      let redisState: string | null = null;

      try {
        redisState = await redis.get(redisKeyRaw);
        if (!redisState) redisState = await redis.get(redisKeyNorm);
      } catch (rErr) {
        this.logger.warn(`[facebookCallback] redis get failed: ${String(rErr)}`);
      }

      let validState = false;

      if (redisState === '1') {
        validState = true;
        // Attempt cleanup for both keys
        try {
          await redis.del(redisKeyRaw);
        } catch {}
        try {
          await redis.del(redisKeyNorm);
        } catch {}
      }

      // Cookie comparisons in multiple possible encodings/forms
      if (!validState) {
        if (storedStateCookieRaw && storedStateCookieRaw === returnedStateRaw) {
          validState = true;
        } else if (storedStateCookieRaw && storedStateCookieRaw === returnedState) {
          validState = true;
        } else if (storedStateCookie && storedStateCookie === returnedState) {
          validState = true;
        }
      }

      if (!validState) {
        this.logger.warn(
          `[facebookCallback] state mismatch returnedRaw=${returnedStateRaw} returnedNorm=${returnedState} cookieRaw=${storedStateCookieRaw} cookieNorm=${storedStateCookie} redis=${redisState}`,
        );
        return res.status(400).send('Invalid or expired state');
      }

      // Clear cookie (same options used when setting)
      res.clearCookie('oauth_state', {
        domain: process.env.COOKIE_DOMAIN || '.phlyphant.com',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      });

      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';
      const redirectUri = normalizeRedirectUri(
        process.env.FACEBOOK_CALLBACK_URL ||
          `https://api.phlyphant.com/auth/facebook/callback`,
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

      const redirectBase =
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://www.phlyphant.com';

      const finalUrl = buildFinalUrl(redirectBase, customToken);

      this.logger.log(`[facebookCallback] redirect=${finalUrl}`);
      return res.redirect(finalUrl);
    } catch (err: any) {
      this.logger.error('[facebookCallback] error: ' + err.message);
      return res.status(500).send('Facebook callback error');
    }
  }

  // =======================================
  // CREATE SESSION COOKIE AFTER /auth/complete
  // =======================================
  @Post('complete')
  async complete(@Body() body: any, @Res() res: Response) {
    const idToken = body?.idToken as string | undefined;

    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    try {
      const expiresIn = Number(
        process.env.SESSION_COOKIE_MAX_AGE_MS || 432000000,
      );

      const sessionCookie = await admin.auth().createSessionCookie(idToken, {
        expiresIn,
      });

      const cookieName = process.env.SESSION_COOKIE_NAME || '__session';
      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';
      const isProd = process.env.NODE_ENV === 'production';

      const cookieOptions: any = {
        httpOnly: true,
        secure: isProd,
        sameSite: 'none',
        domain: cookieDomain,
        path: '/',
        maxAge: expiresIn,
        expires: new Date(Date.now() + Number(expiresIn)),
      };

      this.logger.log(`[complete] cookieOptions=${JSON.stringify(cookieOptions)}`);

      res.cookie(cookieName, sessionCookie, cookieOptions);

      return res.json({ ok: true });
    } catch (e: any) {
      this.logger.error('[complete] session cookie error: ' + String(e));
      return res
        .status(500)
        .json({ error: 'create_session_failed', detail: e?.message });
    }
  }

  // =======================================
  // SESSION CHECK
  // =======================================
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
      this.logger.warn('[session-check] invalid session: ' + String(e));
      return res.status(401).json({ valid: false });
    }
  }
}
