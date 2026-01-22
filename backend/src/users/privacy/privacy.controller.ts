// backend/src/users/privacy/privacy.controller.ts

import {
  Controller,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersPrivacyService } from './users-privacy.service';
import { UpdatePostPrivacyDto } from './dto/update-post-privacy.dto';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';

@Controller('/api/users/me')
export class PrivacyController {
  constructor(private readonly service: UsersPrivacyService) {}

  @Patch('/post-privacy')
  @UseGuards(AccessTokenCookieAuthGuard)
  async updatePostPrivacy(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: UpdatePostPrivacyDto,
  ) {
    return this.service.updateMyPostPrivacy({
      userId: req.user.userId,
      isPrivate: dto.isPrivate,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}

