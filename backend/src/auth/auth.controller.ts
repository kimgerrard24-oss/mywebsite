// src/auth/auth.controller.ts
import {
  Controller,
  Get,
  Post,
  Req,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Res,
  Body,
  Logger,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import IORedis from 'ioredis';
import * as admin from 'firebase-admin';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { GetUser } from './get-user.decorator';
import { RateLimitContext } from '../common/rate-limit/rate-limit.decorator';
import { AuthRateLimitGuard } from '../common/rate-limit/auth-rate-limit.guard';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';


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

  try {
    s = decodeURIComponent(s);
  } catch {}

  s = s.replace(/\+/g, ' ');
  s = s.replace(/%2B/gi, '+');
  s = s.replace(/%3D/gi, '=');
  s = s.replace(/%2F/gi, '/');

  s = s.replace(/^["']|["']$/g, '').trim();
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

@Controller('auth/local')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly auth: AuthService) {}
    
  // Authentication / Auth System
@RateLimit('register')
@Post('register')
@HttpCode(HttpStatus.CREATED)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.flatMap(err =>
        Object.values(err.constraints || {})
      );
      return new BadRequestException(messages);
    },
  }),
)
async register(@Body() dto: RegisterDto) {
  const user = await this.auth.register(dto);

  return {
    success: true,
    message: 'User registered successfully',
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    },
  };
}


  // Local Login
  @RateLimit('login')
  @Public()
  @Post('login')
  @UseGuards(AuthRateLimitGuard)
  @RateLimitContext('login')
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

    res.cookie('local_access', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      domain: cookieDomain,
      path: '/',
      maxAge: 1000 * 60 * 15,
    });

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

  // Local Refresh Token
  @Post('refresh')
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

  // Local Logout
  @Post('logout')
  async localLogout(@Res() res: Response) {
    const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

    res.clearCookie('local_access', { domain: cookieDomain, path: '/' });
    res.clearCookie('local_refresh', { domain: cookieDomain, path: '/' });

    return res.json({ ok: true });
  }

  // Local Request Password Reset
  @Public()
  @Post('request-password-reset')
  @RateLimitContext('resetPassword')
  async localRequestReset(@Body() body: any) {
    const { email } = body;

    if (!email) {
      return { error: 'Email is required' };
    }

    return this.auth.requestPasswordResetLocal(email);
  }

  // Local Reset Password
  @Public()
  @Post('reset-password')
  @RateLimitContext('resetPassword')
  async localResetPassword(@Body() body: any) {
    const { uid, token, newPassword } = body;

    if (!uid || !token || !newPassword) {
      return { error: 'Missing fields' };
    }

    return this.auth.resetPasswordLocal(uid, token, newPassword);
  }

  // Verify Email
  @Get('verify-email')
  async localVerifyEmail(
    @Query('uid') uid: string,
    @Query('token') token: string,
  ) {
    if (!uid || !token) {
      return { error: 'Missing uid or token' };
    }

    return this.auth.verifyEmailLocal(uid, token);
  }

  // GOOGLE OAuth Start
  @Get('google')
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

      const state = crypto.randomBytes(16).toString('hex');
      const stateKey = `oauth_state_${state}`;

      try {
        await redis.setex(stateKey, 300, '1');
        this.logger.log(`[googleAuth] set redis key ${stateKey}`);
      } catch (rErr) {
        this.logger.warn(`[googleAuth] redis set failed: ${String(rErr)}`);
      }

      res.setHeader('Access-Control-Allow-Credentials', 'true');

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

      return res.redirect(authUrl);
    } catch (e: any) {
      this.logger.error('[googleAuth] error: ' + e.message);
      return res.status(500).send('Google auth error');
    }
  }

  // GOOGLE OAuth Callback
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
        return res.status(400).send('Invalid or expired state');
      }

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

      return res.redirect(finalUrl);
    } catch (err: any) {
      this.logger.error('[googleCallback] error: ' + err.message);
      return res.status(500).send('Authentication error');
    }
  }

  // FACEBOOK OAuth Start
  @Get('facebook')
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

      const state = crypto.randomBytes(16).toString('hex');
      const stateKey = `oauth_state_${state}`;

      try {
        await redis.setex(stateKey, 300, '1');
      } catch {}

      res.setHeader('Access-Control-Allow-Credentials', 'true');

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
          `https://api.phlyphant.com/auth/local/facebook/callback`,
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

      return res.redirect(authUrl);
    } catch (e: any) {
      this.logger.error('[facebookAuth] error: ' + e.message);
      return res.status(500).send('Facebook auth error');
    }
  }

  // FACEBOOK OAuth Callback
  @Get('facebook/callback')
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const returnedStateRaw = req.query.state as string;

      if (!code || !returnedStateRaw) {
        return res.status(400).send('Missing code or state');
      }

      const returnedState = normalizeOAuthState(returnedStateRaw);
      const storedStateCookieRaw = req.cookies?.oauth_state || null;
      const storedStateCookie = normalizeOAuthState(storedStateCookieRaw);

      const redisKeyRaw = `oauth_state_${returnedStateRaw}`;
      const redisKeyNorm = `oauth_state_${returnedState}`;

      let redisState: string | null = null;

      try {
        redisState = await redis.get(redisKeyRaw);
        if (!redisState) redisState = await redis.get(redisKeyNorm);
      } catch {}

      let validState = false;

      if (redisState === '1') {
        validState = true;
        try {
          await redis.del(redisKeyRaw);
        } catch {}
        try {
          await redis.del(redisKeyNorm);
        } catch {}
      }

      if (!validState) {
        if (
          storedStateCookieRaw &&
          storedStateCookieRaw === returnedStateRaw
        ) {
          validState = true;
        } else if (
          storedStateCookieRaw &&
          storedStateCookieRaw === returnedState
        ) {
          validState = true;
        } else if (storedStateCookie && storedStateCookie === returnedState) {
          validState = true;
        }
      }

      if (!validState) {
        return res.status(400).send('Invalid or expired state');
      }

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
          `https://api.phlyphant.com/auth/local/facebook/callback`,
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

      return res.redirect(finalUrl);
    } catch (err: any) {
      this.logger.error('[facebookCallback] error: ' + err.message);
      return res.status(500).send('Facebook callback error');
    }
  }

  // CREATE SESSION COOKIE
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
        sameSite: 'None',
        domain: cookieDomain,
        path: '/',
        maxAge: expiresIn,
        expires: new Date(Date.now() + Number(expiresIn)),
      };

      res.cookie(cookieName, sessionCookie, cookieOptions);

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
