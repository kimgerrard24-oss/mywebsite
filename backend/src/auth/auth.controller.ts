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
  HttpException,
  Logger,
  UnauthorizedException,
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
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { AuthRepository } from './auth.repository';
import { AuditService } from './audit.service';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import { RateLimitService } from '../common/rate-limit/rate-limit.service';


if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined in environment variables');
}

const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,

  retryStrategy(times) {
    return Math.min(times * 200, 30000); 
  },

  reconnectOnError(err) {
    const triggers = ['READONLY', 'ECONNRESET', 'ECONNREFUSED'];
    return triggers.some((msg) => err.message.includes(msg));
  },
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
              private readonly rateLimitService: RateLimitService,

  ) {}

  // Local register
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

  // local login
@Public()
@RateLimit('login')
@Post('login')
@HttpCode(HttpStatus.OK)
async login(
  @Body() body: LoginDto,
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {
  // =========================================================
  // Extract client IP safely
  // =========================================================
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.ip || req.socket?.remoteAddress || 'unknown';

  const normalizedIp = rawIp.replace(/^::ffff:/, '').replace(/:\d+$/, '');
  const keyIp = normalizedIp.replace(/[^a-zA-Z0-9_-]/g, '_').trim() || 'unknown';

  const ua = (req.headers['user-agent'] as string) || null;

  // =========================================================
  // 1) Rate limit BEFORE password check
  // =========================================================
  const status = await this.rateLimitService.check('login', keyIp);

  if (status.blocked) {
    await this.audit.logLoginAttempt({
      email: body.email,
      ip: normalizedIp,
      userAgent: ua,
      success: false,
      reason: 'rate_limit_block',
    });

    throw new HttpException(
      `Too many attempts. Try again after ${status.retryAfterSec} seconds`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  // =========================================================
  // 2) Validate credentials
  // =========================================================
  const user = await this.authService.validateUser(body.email, body.password);

  if (!user) {
    // count fail
    await this.rateLimitService.consume('login', keyIp);

    await this.audit.logLoginAttempt({
      email: body.email,
      ip: normalizedIp,
      userAgent: ua,
      success: false,
      reason: 'invalid_credentials',
    });

    throw new UnauthorizedException('Invalid email or password');
  }

  // =========================================================
  // 3) SUCCESS — clear counter
  // =========================================================
  await this.rateLimitService.reset('login', keyIp);

  await this.audit.logLoginAttempt({
    userId: user.id,
    email: user.email,
    ip: normalizedIp,
    userAgent: ua,
    success: true,
  });

  // =========================================================
  // 4) Create Firebase session cookie
  // =========================================================

  // Step 1: create Firebase Custom Token
  const customToken = await this.authService.createFirebaseCustomToken(
    user.id,
    user,
  );

  // Step 2: convert to session cookie
  const expiresIn =
    (Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 60 * 15) * 1000;

  const sessionCookie = await this.authService.createSessionCookie(
    customToken,
    expiresIn,
  );

  // Step 3: send cookie
  res.cookie(
    process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access',
    sessionCookie,
    {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE !== 'false',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: expiresIn,
      path: '/',
    },
  );

  // =========================================================
  // 5) Return safe user
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return {
    success: true,
    data: {
      user: safeUser,
      expiresIn,
    },
  };
}


// verify-email
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
