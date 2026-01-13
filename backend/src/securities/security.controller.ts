// backend/src/securities/security.controller.ts

import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { AccountLockDto } from './dto/account-lock.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import type { Request } from 'express';

@Controller('api/security')
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService,
  ) {}

  @Post('account-lock')
  @UseGuards(AccessTokenCookieAuthGuard)
  async lockMyAccount(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: AccountLockDto,
  ) {
    return this.securityService.lockMyAccount({
      userId: req.user.userId,
      credentialTokenHash: dto.credentialToken,
      meta: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });
  }
}
