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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken =
      (req.cookies && req.cookies[REFRESH_TOKEN_COOKIE_NAME]) ||
      (req.signedCookies && req.signedCookies[REFRESH_TOKEN_COOKIE_NAME]) ||
      (req.body && (req.body.refreshToken as string)) ||
      '';

    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      null;

    const userAgent = req.headers['user-agent'] || null;

    const result = await this.localRefreshService.refreshTokens(refreshToken, {
      ip,
      userAgent,
    });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
      path: '/',
    });

    // FIX: change path to root, so cookie is sent always
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
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
