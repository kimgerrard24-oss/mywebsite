// backend/src/search/search.controller.ts

import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { SearchService } from './search.service';
import { SearchPostsQueryDto } from './dto/search-posts.query.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { SearchUsersQueryDto } from './dto/search-users.query.dto';
import { SearchTagsQueryDto } from './dto/search-tags.query.dto';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  /**
   * GET /search/posts?q=
   */
  @Get('posts')
  @RateLimit('mentionSearch')
  @UseGuards(AccessTokenCookieAuthGuard)
  async searchPosts(
    @Query() query: SearchPostsQueryDto,
    @Req() req: Request,
  ) {
    const viewerUserId = (req.user as any)?.userId ?? null;

    return this.service.searchPosts({
      ...query,
      viewerUserId, // ✅ สำคัญ
    });
  }

  /**
   * GET /search/users?q=
   */
  @Get('users')
  @RateLimit('mentionSearch')
  @UseGuards(AccessTokenCookieAuthGuard)
  async searchUsers(
    @Query() query: SearchUsersQueryDto,
    @Req() req: Request,
  ) {
    const viewerUserId = (req.user as any)?.userId ?? null;

    return this.service.searchUsers({
      ...query,
      viewerUserId, // ✅ ตัวนี้ทำให้ block filter ทำงาน
    });
  }

  /**
   * GET /search/tags?q=
   */
  @Get('tags')
  @RateLimit('mentionSearch')
  @UseGuards(AccessTokenCookieAuthGuard)
  async searchTags(
    @Query() query: SearchTagsQueryDto,
    @Req() req: Request,
  ) {
    const viewerUserId = (req.user as any)?.userId ?? null;

    return this.service.searchTags({
      ...query,
      viewerUserId, // ✅ filter post ของ tag ด้วย
    });
  }
}

