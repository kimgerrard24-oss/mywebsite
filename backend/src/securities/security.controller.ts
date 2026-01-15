// backend/src/securities/security.controller.ts

import {
  Controller,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import type { Request } from 'express';

@Controller('api/security')
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService,
  ) {}

  /**
   * POST /api/security/account-lock
   *
   * Flow (Option A):
   * - user must verify credential first (verify-credential)
   * - session is marked as sensitive-verified in Redis
   * - this endpoint checks verified session and locks account
   *
   * Authority:
   * - Backend only (no client token)
   * - DB = source of truth for account lock
   */
  @Post('account-lock')
  @UseGuards(AccessTokenCookieAuthGuard)
  async lockMyAccount(
    @Req()
    req: Request & {
      user?: { userId?: string; jti?: string };
    },
  ) {
    // =================================================
    // 1) Defensive auth check (never trust middleware)
    // =================================================
    const userId = req.user?.userId;
    const jti = req.user?.jti;

    if (
      !userId ||
      typeof userId !== 'string' ||
      !jti ||
      typeof jti !== 'string'
    ) {
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    // =================================================
    // 2) Resolve client IP (proxy-safe)
    // =================================================
    const forwarded =
      req.headers['x-forwarded-for'];

    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.ip || undefined;

    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : undefined;

    // =================================================
    // 3) Delegate to domain service (authority)
    // =================================================
    return this.securityService.lockMyAccount({
      userId,
      jti,
      meta: {
        ip,
        userAgent,
      },
    });
  }
}
