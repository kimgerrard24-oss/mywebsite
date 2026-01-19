// file: src/auth/password-reset.controller.ts

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PasswordResetService } from './password-reset.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthRateLimitGuard } from '../common/rate-limit/auth-rate-limit.guard';
import { Public } from './decorators/public.decorator';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';

@Controller('auth/local')
export class PasswordResetController {
  constructor(
    private readonly passwordResetService: PasswordResetService,
  ) {}

  // ============================
  // POST /auth/local/request-password-reset
  // ============================
  @Public()
  @UseGuards(AuthRateLimitGuard)
  @RateLimit('requestPasswordReset')
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() body: RequestPasswordResetDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.ip || req.socket?.remoteAddress || undefined;

    const ip =
      rawIp
        ?.replace(/^::ffff:/, '')
        .replace(/:\d+$/, '')
        .trim() || undefined;

    const userAgent =
      (req.headers['user-agent'] as string) || undefined;

    await this.passwordResetService.requestPasswordReset(
      body.email,
      ip,
      userAgent,
    );

    return {
      message:
        'If an account exists for this email, a password reset link has been sent.',
    };
  }

  // ============================
  // POST /auth/local/reset-password
  // ============================
  @Public()
  @UseGuards(AuthRateLimitGuard)
  @RateLimit('confirmPasswordReset')
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.ip || req.socket?.remoteAddress || undefined;

    const ip =
      rawIp
        ?.replace(/^::ffff:/, '')
        .replace(/:\d+$/, '')
        .trim() || undefined;

    const userAgent =
      (req.headers['user-agent'] as string) || undefined;

    await this.passwordResetService.resetPassword(
      dto,
      ip,
      userAgent,
    );

    return {
      message:
        'If the reset link is valid, your password has been updated. If not, you may request a new link.',
    };
  }
}

