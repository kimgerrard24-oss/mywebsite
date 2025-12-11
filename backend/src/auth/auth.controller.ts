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
  Header,
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
import { AuthGuard } from './auth.guard';
import { UserProfileDto } from './dto/user-profile.dto';
import { AccessTokenCookieAuthGuard } from './guards/access-token-cookie.guard';

interface JwtUserPayload {
  // ปรับตาม payload จริงของคุณ
  sub?: string;      // กรณีใช้ sub เป็น userId
  userId?: string;   // กรณีใช้ userId ตรง ๆ
  email?: string;
  // ...field อื่น ๆ ที่ strategy ใส่ให้
}

interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

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

  constructor(
    private readonly authService: AuthService,
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

// =========================================================
// local login
// =========================================================
@Public()
@Post('login')
@HttpCode(HttpStatus.OK)
async login(
  @Body() body: LoginDto,
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {

  const forwarded = req.headers['x-forwarded-for'];
  const rawIp =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.ip || req.socket?.remoteAddress || 'unknown';

  const normalizedIp = rawIp
    .replace(/^::ffff:/, '')
    .replace(/:\d+$/, '');

  const key = `${body.email}:${normalizedIp}`
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .trim() || 'unknown';

  const ua = (req.headers['user-agent'] as string) || null;

  const user = await this.authService.validateUser(
    body.email,
    body.password,
  );

  if (!user) {

    const consumeResult = await this.rateLimitService.consume('login', key);

    if (consumeResult.blocked) {
      await this.audit.logLoginAttempt({
        email: body.email,
        ip: normalizedIp,
        userAgent: ua,
        success: false,
        reason: 'rate_limit_block',
      });

      throw new HttpException(
        `Too many attempts. Try again after ${consumeResult.retryAfterSec} seconds`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const status = await this.rateLimitService.check('login', key);

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

    await this.audit.logLoginAttempt({
      email: body.email,
      ip: normalizedIp,
      userAgent: ua,
      success: false,
      reason: 'invalid_credentials',
    });

    throw new UnauthorizedException('Invalid email or password');
  }

  await this.rateLimitService.reset('login', key);

  await this.audit.logLoginAttempt({
    userId: user.id,
    email: user.email,
    ip: normalizedIp,
    userAgent: ua,
    success: true,
  });

  const session = await this.authService.createSessionToken(user.id);

  const accessMaxAgeMs =
    (Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 60 * 15) * 1000;
  const refreshMaxAgeMs =
    (Number(process.env.REFRESH_TOKEN_TTL_SECONDS) ||
      60 * 60 * 24 * 30) *
    1000;

  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
  const secureFlag = process.env.COOKIE_SECURE !== 'false';

  res.cookie(
    process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access',
    session.accessToken,
    {
      httpOnly: true,
      secure: true,
      sameSite: 'none',   
      domain: process.env.COOKIE_DOMAIN,
      maxAge: accessMaxAgeMs,
      path: '/',
    },
  );

  if (session.refreshToken) {
    res.cookie(
      process.env.REFRESH_TOKEN_COOKIE_NAME || 'phl_refresh',
      session.refreshToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',  
        domain: process.env.COOKIE_DOMAIN,
        maxAge: refreshMaxAgeMs,
        path: '/',
      },
    );
  }

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
      expiresIn: session.expiresIn,
    },
  };
}

// Local Logout
@UseGuards(AccessTokenCookieAuthGuard, RateLimitGuard)
@Post('logout')
@HttpCode(200)
async logout(@Req() req: Request, @Res() res: Response) {
  await this.authService.logout(req, res);
  return res.json({ message: 'Logged out successfully' });
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

    // local profile
   //@Get('profile')
  //@UseGuards(JwtAuthGuard)
  //@HttpCode(HttpStatus.OK)
  //@Header('Cache-Control', 'no-store') // ห้าม cache โปรไฟล์บน proxy/broswer
  //async getProfile(
   // @Req() req: AuthenticatedRequest,
  //): Promise<{ success: boolean; data: UserProfileDto }> {
   // const jwtUser = req.user;

    //if (!jwtUser) {
     // throw new UnauthorizedException('Missing authentication payload');
   // }

    //const userId = jwtUser.userId || jwtUser.sub;

    //if (!userId) {
     // this.logger.warn(`JWT payload missing userId/sub: ${JSON.stringify(jwtUser)}`);
      //throw new UnauthorizedException('Invalid authentication payload');
    //}

    //const profile = await this.authService.getProfile(userId);

    //this.logger.debug(`Profile requested for userId=${userId}`);

    //return {
     // success: true,
      //data: profile,
    //};
  //}
}
