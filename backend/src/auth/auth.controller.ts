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
import IORedis from 'ioredis';
import axios from 'axios';
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

  @RateLimit('register')
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((err) =>
          Object.values(err.constraints || {}),
        );
        return new BadRequestException(messages);
      },
    }),
  )
  async register(@Body() dto: RegisterDto & { turnstileToken?: string }) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    const token = dto.turnstileToken;

    if (!token) {
      throw new BadRequestException('Missing Turnstile token');
    }

    if (!secret) {
      throw new BadRequestException('Server missing Turnstile secret key');
    }

    const verify = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(
        token,
      )}`,
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (!verify.data.success) {
      throw new BadRequestException('Turnstile verification failed');
    }

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

  @Post('logout')
  async localLogout(@Res() res: Response) {
    const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';

    res.clearCookie('local_access', { domain: cookieDomain, path: '/' });
    res.clearCookie('local_refresh', { domain: cookieDomain, path: '/' });

    return res.json({ ok: true });
  }

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

  @Get('verify-email')
  async verifyEmail(@Query('uid') uid: string, @Query('token') token: string) {
    if (!uid || !token) {
      throw new BadRequestException('Missing verification token or uid');
    }

    const result = await this.auth.verifyEmailLocal(uid, token);

    return {
      message: 'Email verified successfully',
      result,
    };
  }
}
