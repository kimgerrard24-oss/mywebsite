// src/auth/local/local-refresh.controller.ts

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

  constructor(private readonly localRefreshService: LocalRefreshService) {}

  /**
   * POST /auth/local/refresh
   *
   * - อ่าน refresh token จาก HTTP-only cookie
   * - validate + rotate token
   * - set cookie ใหม่ (access + refresh)
   * - คืนข้อมูล user + token เผื่อ frontend ใช้ใน memory
   *
   * หมายเหตุ:
   *   ต้องแน่ใจว่าใน main.ts มีใช้ cookie-parser แล้ว
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken =
      (req.cookies && req.cookies[REFRESH_TOKEN_COOKIE_NAME]) ||
      (req.signedCookies && req.signedCookies[REFRESH_TOKEN_COOKIE_NAME]) ||
      (req.body && (req.body.refreshToken as string)) || // เผื่อกรณีส่งมากับ body
      '';

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    const result = await this.localRefreshService.refreshTokens(refreshToken, {
      ip,
      userAgent,
    });

    // ตั้งค่า cookie ใหม่
    const isProduction = process.env.NODE_ENV === 'production';

    // Access token: อายุสั้น ใช้ใน header "Authorization: Bearer xxx" หรือ cookie ก็ได้
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
      path: '/', // คุณปรับให้เหมาะสมได้ เช่น `/`
    });

    // Refresh token: อายุยาว ต้องเป็น HTTP-only และ secure
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
      path: '/auth/local/refresh', // จำกัด path เฉพาะ refresh endpoint
    });

    // ไม่ส่ง refresh token กลับใน body ก็ได้ ถ้าอยากให้ปลอดภัยสุด
    // ที่นี่ส่งกลับไปด้วย เผื่อคุณต้องใช้ใน client ที่ไม่รองรับ cookie
    return {
      accessToken: result.accessToken,
      // ถ้าไม่ต้องการให้ frontend แตะ refresh token เลยให้ comment ออก
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }
}
