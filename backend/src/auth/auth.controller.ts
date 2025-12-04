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
  Inject,
  Logger,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import IORedis from 'ioredis';
import axios from 'axios';
import { RateLimitContext } from '../common/rate-limit/rate-limit.decorator';
import { AuthRateLimitGuard } from '../common/rate-limit/auth-rate-limit.guard';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { AuthRepository } from './auth.repository';
import { AuditService } from './audit.service';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';


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

  constructor(private readonly authService: AuthService,
              private readonly authRepo: AuthRepository,
              private readonly audit: AuditService,
  ) {}

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

    const user = await this.authService.register(dto);

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
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRateLimitGuard)
  @RateLimitContext('login')
   async login(@Body() body: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || null;
    const ua = (req.headers['user-agent'] as string) || null;

    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {

      this.logger.warn(`Failed login attempt for ${body.email} from ${ip}`);
      await this.audit.logLoginAttempt({ email: body.email, ip, userAgent: ua, success: false, reason: 'invalid_credentials' });
      return { success: false, message: 'Invalid email or password' };
    }

    const session = await this.authService.createSessionToken(user.id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE !== 'false', // default true
      sameSite: 'strict' as const,
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: (Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 60 * 15) * 1000,
      path: '/',
    };

    res.cookie(process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access', session.accessToken, cookieOptions);

    if (session.refreshToken) {
      res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME || 'phl_refresh', session.refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE !== 'false',
        sameSite: 'strict' as const,
        domain: process.env.COOKIE_DOMAIN || undefined,
        maxAge: (Number(process.env.REFRESH_TOKEN_TTL_SECONDS) || 60 * 60 * 24 * 30) * 1000,
        path: '/',
      });
    }

    try {
      const ipKey = req.ip || (req.headers['x-forwarded-for'] as string) || '';
      await RateLimitGuard.revokeIp(ipKey);
    } catch (err) {
    }

    const safeUser = { ...user };
    delete (safeUser as any).passwordHash;

    return {
      success: true,
      data: {
        user: safeUser,
        expiresIn: session.expiresIn,
      },
    };
  }

 
  @Get('verify-email')
  async verifyEmail(@Query('uid') uid: string, @Query('token') token: string) {
    if (!uid || !token) {
      throw new BadRequestException('Missing verification token or uid');
    }

    const result = await this.authService.verifyEmailLocal(uid, token);

    return {
      message: 'Email verified successfully',
      result,
    };
  }
}
