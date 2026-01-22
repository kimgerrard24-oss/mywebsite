// backend/src/feed/feed.controller.ts

import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { FeedService } from './feed.service';
import { GetFeedQuery } from './dto/get-feed.query';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * Public + Auth feed (viewer-aware)
   * - If not logged in: public feed
   * - If logged in: personalized filters (block, follow UX flags)
   */
  @Get()
@UseGuards(AccessTokenCookieAuthGuard)
async getFeed(
  @Req() req: Request & { user?: { userId: string } },
  @Query() query: GetFeedQuery,
) {
  const viewerUserId = req.user?.userId ?? null;

  const limit =
    typeof query.limit === 'number' && query.limit > 0
      ? query.limit
      : 20; // ✅ default production limit

  return this.feedService.getFeed({
    viewerUserId,
    limit,
    cursor: query.cursor,
    mediaType: query.mediaType,
  });
}
}
