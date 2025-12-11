// backend/src/auth/dto/local/local-refresh.controller.ts
import {
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LocalRefreshService } from './local-refresh.service';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from '../../session/session.constants';

@Controller('auth/local')
export class LocalRefreshController {
  private readonly logger = new Logger(LocalRefreshController.name);

  constructor(
    private readonly localRefreshService: LocalRefreshService,
  ) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // ดึง refresh token จาก signed cookies, cookies หรือ body
    let oldRefreshToken =
      (req.signedCookies && req.signedCookies[REFRESH_TOKEN_COOKIE_NAME]) ||
      (req.cookies && req.cookies[REFRESH_TOKEN_COOKIE_NAME]) ||
      (req.body && (req.body.refreshToken as string)) ||
      '';

    if (!oldRefreshToken) {
      this.logger.warn('Refresh token missing');
      return {
        error: 'Refresh token required',
      };
    }

    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      null;

    const userAgent = req.headers['user-agent'] || null;

    // ใช้ LocalRefreshService เพื่อ:
    // - ยืนยัน refresh token เดิม
    // - ยกเลิก refresh token เดิม
    // - สร้าง session ใหม่ (access token + refresh token)
    const result = await this.localRefreshService.refreshTokens(
      oldRefreshToken,
      { ip, userAgent },
    );

    const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';
    const secureFlag = process.env.NODE_ENV === 'production'; // Set secure to true only in production environment

    // Set new access token in cookie
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'none', // Use 'Lax' based on your environment needs
      domain: cookieDomain,
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
      path: '/',
    });

    // Set new refresh token in cookie
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'none', // Use 'Lax' based on your environment needs
      domain: cookieDomain,
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
      path: '/',
    });

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }
}
