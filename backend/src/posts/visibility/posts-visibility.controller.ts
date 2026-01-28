// backend/src/posts/visibility/posts-visibility.controller.ts

import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { PostsVisibilityService } from './posts-visibility.service';
import { ValidatePostVisibilityDto } from './dto/validate-post-visibility.dto';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('posts/visibility')
export class PostsVisibilityController {
  constructor(
    private readonly service: PostsVisibilityService,
  ) {}

  /**
   * POST /api/posts/visibility/validate
   * Backend authority
   */
  @Post('validate')
  @RateLimit('postsVisibilityValidate')
  @UseGuards(AccessTokenCookieAuthGuard)
  async validate(
    @Req() req: Request & { user?: { userId: string } },
    @Body() dto: ValidatePostVisibilityDto,
  ) {
    const viewerUserId = req.user?.userId ?? null;

    return this.service.validateVisibility({
      postId: dto.postId,
      viewerUserId,
    });
  }
}
