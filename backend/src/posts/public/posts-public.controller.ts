// backend/src/posts/public/posts-public.controller.ts

import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';

import { PostsPublicService } from './posts-public.service';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { ParsePostIdPipe } from '../pipes/parse-post-id.pipe';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller()
export class PostsPublicController {
  constructor(
    private readonly service: PostsPublicService,
  ) {}

  /**
   * ==========================================
   * Public SEO Route
   * GET /p/:postId
   * ==========================================
   */
  @Get('p/:postId')
  @UseGuards(OptionalAuthGuard)
  @RateLimit('publicPostRead')
  async getPublicPost(
    @Param('postId', ParsePostIdPipe) postId: string,
    @Req() req: Request,
  ) {
    const viewer =
      req.user && typeof req.user === 'object'
        ? { userId: (req.user as any).userId }
        : null;

    const post = await this.service.getPublicPostDetail({
      postId,
      viewerUserId: viewer?.userId ?? null,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }
}
