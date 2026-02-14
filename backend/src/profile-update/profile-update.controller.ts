// backend/src/profile-update/profile-update.controller.ts

import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SessionUser } from '../auth/services/validate-session.service';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { ProfileUpdateService } from './profile-update.service';
import { CreateProfileUpdateDto } from './dto/create-profile-update.dto';
import { PublishProfileUpdateDto } from './dto/publish-profile-update.dto';

@Controller('users/me/profile-update')
export class ProfileUpdateController {
  constructor(private readonly service: ProfileUpdateService) {}

  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('profileUpdateDraft')
  @Post('draft')
  async createDraft(
    @CurrentUser() user: SessionUser,
    @Body() dto: CreateProfileUpdateDto,
  ) {
    return this.service.createOrUpdateDraft(user.userId, dto);
  }

  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('profileUpdatePublish')
  @Post('publish')
  async publish(
    @CurrentUser() user: SessionUser,
    @Body() dto: PublishProfileUpdateDto,
  ) {
    return this.service.publish(user.userId, dto);
  }
}
