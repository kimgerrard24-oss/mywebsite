// backend/src/users/privacy/users-privacy.controller.ts

import {
  Controller,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersPrivacyService } from './users-privacy.service';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';

import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';

@Controller('users/me/privacy')
export class UsersPrivacyController {
  constructor(
    private readonly privacyService: UsersPrivacyService,
  ) {}

  @Patch()
  @UseGuards(AccessTokenCookieAuthGuard)
  async updateMyPrivacy(
    @Req() req: Request & { user?: { userId: string; jti: string } },
    @Body() dto: UpdatePrivacyDto,
  ) {
    const userId = req.user!.userId;

    return this.privacyService.updateMyPrivacy({
      userId,
      isPrivate: dto.isPrivate,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
