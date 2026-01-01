// backend/src/search/search.controller.ts

import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchPostsQueryDto } from './dto/search-posts.query.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { SearchUsersQueryDto } from './dto/search-users.query.dto';
import { SearchTagsQueryDto } from './dto/search-tags.query.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  /**
   * GET /search/posts?q=
   * - Cookie-based auth
   * - Backend authority
   */
  @Get('posts')
  @UseGuards(AccessTokenCookieAuthGuard)
  async searchPosts(
    @Query() query: SearchPostsQueryDto,
  ) {
    return this.service.searchPosts(query);
  }

  /**
   * GET /search/users?q=
   * - Cookie-based auth
   * - Backend authority
   */
  @Get('users')
  @UseGuards(AccessTokenCookieAuthGuard)
  async searchUsers(
    @Query() query: SearchUsersQueryDto,
  ) {
    return this.service.searchUsers(query);
  }

   /**
   * GET /search/tags?q=
   * - Cookie-based auth
   * - Backend authority
   */
  @Get('tags')
  @UseGuards(AccessTokenCookieAuthGuard)
  async searchTags(
    @Query() query: SearchTagsQueryDto,
  ) {
    return this.service.searchTags(query);
  }
}
