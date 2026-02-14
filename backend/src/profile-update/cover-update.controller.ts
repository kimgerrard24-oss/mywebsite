// backend/src/profile-update/cover-update.controller.ts

import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import type { SessionUser } from '../auth/services/validate-session.service';
import { CoverUpdateService } from './cover-update.service';
import { CreateCoverUpdateDto } from './dto/create-cover-update.dto';

@Controller('users/me/cover-update')
export class CoverUpdateController {
  constructor(
    private readonly service: CoverUpdateService,
  ) {}

  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('coverUpdateDraft')
  @Post('draft')
  async createDraft(
    @CurrentUser() user: SessionUser,
    @Body() dto: CreateCoverUpdateDto,
  ) {
    return this.service.createOrUpdateDraft(
      user.userId,
      dto,
    );
  }

  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('coverUpdatePublish')
  @Post('publish')
  async publish(
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.publish(user.userId);
  }
}
