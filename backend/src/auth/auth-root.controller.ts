// backend/src/auth/auth-root.controller.ts

import {
  Controller,
  Post,
  Req,
  Body,
  HttpCode,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { AccessTokenCookieAuthGuard } from './guards/access-token-cookie.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { SessionUser } from './services/validate-session.service';
import { RequestSetPasswordDto } from './dto/request-set-password.dto';
import { ConfirmSetPasswordDto } from './dto/confirm-set-password.dto';

@Controller('auth')
export class AuthRootController {
  constructor(private readonly authService: AuthService) {}

  // =========================================
  // Request set password (social-only)
  // =========================================
  @UseGuards(AccessTokenCookieAuthGuard)
  @Post('request-set-password')
  @RateLimit('requestSetPassword')
  @HttpCode(200)
  async requestSetPassword(
    @CurrentUser() user: SessionUser,
    @Body() _: RequestSetPasswordDto,
    @Req() req: Request,
  ) {
    if (!user?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    await this.authService.requestSetPassword(user.userId, {
      ip: req.ip,
      userAgent:
        typeof req.headers['user-agent'] === 'string'
          ? req.headers['user-agent']
          : undefined,
    });

    return {
      success: true,
      message:
        'If your account is eligible, a password setup email has been sent.',
    };
  }

  // =========================================
  // Confirm set password
  // =========================================
  @Post('confirm-set-password')
  @RateLimit('confirmSetPassword')
  @HttpCode(200)
  async confirmSetPassword(
    @Body() dto: ConfirmSetPasswordDto,
    @Req() req: Request,
  ) {
    await this.authService.confirmSetPassword({
      token: dto.token,
      newPassword: dto.newPassword,
      meta: {
        ip: req.ip,
        userAgent:
          typeof req.headers['user-agent'] === 'string'
            ? req.headers['user-agent']
            : undefined,
      },
    });

    return { success: true };
  }
}
