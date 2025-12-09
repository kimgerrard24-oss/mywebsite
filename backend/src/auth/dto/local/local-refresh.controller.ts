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
import { SessionService } from '../../session/session.service';

@Controller('auth/local')
export class LocalRefreshController {
  private readonly logger = new Logger(LocalRefreshController.name);

  constructor(
    private readonly localRefreshService: LocalRefreshService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const oldRefreshToken =
      (req.cookies && req.cookies[REFRESH_TOKEN_COOKIE_NAME]) ||
      (req.signedCookies && req.signedCookies[REFRESH_TOKEN_COOKIE_NAME]) ||
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

    const result = await this.localRefreshService.refreshTokens(
      oldRefreshToken,
      {
        ip,
        userAgent,
      },
    );

    // =========================================================
    // Refresh Token Rotation (REVOKE OLD)
    // =========================================================
    try {
      await this.sessionService.revokeByRefreshToken(oldRefreshToken);
    } catch (e) {
      this.logger.error('Failed to revoke old refresh token', e);
    }

    // =========================================================
    // Set new cookies
    // =========================================================
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
      path: '/',
    });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
      path: '/',
    });

    // =========================================================
    // Return result
    // =========================================================
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }
}
