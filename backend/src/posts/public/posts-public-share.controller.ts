// backend/src/posts/public/posts-public-share.controller.ts

import {
  Controller,
  Get,
  Param,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';

import { PostsPublicShareService } from './posts-public-share.service';
import { ParsePostIdPipe } from '../pipes/parse-post-id.pipe';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import type { PublicPostShareResponse } from './dto/public-post-share.response';

@Controller('public/posts')
export class PostsPublicShareController {
  constructor(
    private readonly service: PostsPublicShareService,
  ) {}

  /**
   * ==========================================
   * Public External Share Endpoint
   * ==========================================
   * GET /public/posts/:postId/share
   *
   * - External world (SEO / OG / crawler)
   * - No auth, no session, no cookie
   * - Hard 404 only (no reason leak)
   */
  @Get(':postId/share')
  @HttpCode(200)
  @RateLimit('publicPostShareRead')
  async getPostForShare(
    @Param('postId', ParsePostIdPipe) postId: string,
  ): Promise<PublicPostShareResponse> {
    const post = await this.service.getPostForShare(postId);

    if (!post) {
      // ❗ External endpoint: always hide reason
      throw new NotFoundException('Post not found');
    }

    return post;
  }
}
