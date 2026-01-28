// backend/src/posts/share-stats/posts-share-stats.controller.ts

import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { PostsShareStatsService } from './posts-share-stats.service';

@Controller('posts')
export class PostsShareStatsController {
  constructor(
    private readonly service: PostsShareStatsService,
  ) {}

  /**
   * GET /posts/:id/share-stats
   * Read-only stats but MUST enforce post visibility
   */
  @Get(':id/share-stats')
  @RateLimit('postShareStatsRead')
  @UseGuards(AccessTokenCookieAuthGuard)
  async getShareStats(
    @Param('id') postId: string,
    @Req() req: Request,
  ) {
    const viewer =
      req.user as { userId: string; jti: string };

    return this.service.getShareStats({
      postId,
      viewerUserId: viewer.userId,
    });
  }
}
