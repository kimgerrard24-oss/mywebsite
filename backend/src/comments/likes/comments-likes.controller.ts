// backend/src/comments/likes/comments-likes.controller.ts

import {
  Controller,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { CommentsLikesService } from './comments-likes.service';

@Controller('comments')
export class CommentsLikesController {
  constructor(
    private readonly service: CommentsLikesService,
  ) {}

  /**
   * =========================
   * POST /comments/:id/like
   * =========================
   * Toggle like / unlike comment
   */
  @Post(':id/like')
  @RateLimit('commentLike')
  @UseGuards(AccessTokenCookieAuthGuard)
  async toggleLike(
    @Param('id') commentId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.service.toggleLike({
      commentId,
      userId: user.userId,
    });
  }
}
