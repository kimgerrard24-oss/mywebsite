// backend/src/comments/update-delete/comments-controller
import {
  Body,
  Controller,
  Delete,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { CommentsService } from '../comments.service';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly service: CommentsService,
  ) {}

  /**
   * =========================
   * PUT /comments/:id
   * =========================
   */
  @Put(':id')
  @RateLimit('commentUpdate') 
  @UseGuards(AccessTokenCookieAuthGuard)
  async updateComment(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.service.updateComment({
      commentId,
      content: dto.content,
      viewerUserId: user.userId,
    });
  }

  /**
   * =========================
   * DELETE /comments/:id
   * =========================
   */
  @Delete(':id')
  @RateLimit('commentDelete')
  @UseGuards(AccessTokenCookieAuthGuard)
  async deleteComment(
    @Param('id') commentId: string,
    @CurrentUser() user: { userId: string },
  ) {
    await this.service.deleteComment({
      commentId,
      viewerUserId: user.userId,
    });

    return { success: true };
  }
}
