// backend/src/shares/shares.controller.ts

import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { SharesIntentService } from './shares-intent.service';
import { ShareIntentDto } from './dto/share-intent.dto';
import { SharesService } from './shares.service';
import { CreateShareDto } from './dto/create-share.dto';
import { CreateExternalShareDto } from './dto/create-external-share.dto';
import { SharesExternalService } from './shares-external.service';

@Controller('shares')
export class SharesController {
  constructor(
    private readonly intentService: SharesIntentService,
    private readonly service: SharesService,
    private readonly externalService: SharesExternalService,
  ) {}

  /**
   * POST /shares/intent
   * Decide whether user can share a post and how.
   */
  @Post('intent')
  @HttpCode(HttpStatus.OK)
  @RateLimit('shareIntent')
  @UseGuards(AccessTokenCookieAuthGuard)
  async checkIntent(
    @Body() dto: ShareIntentDto,
    @Req() req: Request,
  ) {
    const actor = req.user as { userId: string; jti: string };

    return this.intentService.checkIntent({
      postId: dto.postId,
      actorUserId: actor.userId,
    });
  }

   /**
   * POST /shares
   * Internal share to user or chat
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RateLimit('shareCreate')
  @UseGuards(AccessTokenCookieAuthGuard)
  async create(
    @Body() dto: CreateShareDto,
    @Req() req: Request,
  ) {
    const actor = req.user as { userId: string; jti: string };

    return this.service.createShare({
      actorUserId: actor.userId,
      postId: dto.postId,
      targetUserId: dto.targetUserId ?? null,
      targetChatId: dto.targetChatId ?? null,
    });
  }

  // ===============================
// POST /shares/external
// ===============================
@Post('external')
@HttpCode(HttpStatus.CREATED)
@RateLimit('shareExternal')
@UseGuards(AccessTokenCookieAuthGuard)
async createExternal(
  @Body() dto: CreateExternalShareDto,
  @Req() req: Request,
) {
  const actor = req.user as { userId: string; jti: string };

  return this.externalService.createExternalShare({
    actorUserId: actor.userId,
    postId: dto.postId,
  });
}
}
