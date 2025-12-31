// backend/src/comments/replies/comments-replies.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { CommentsRepliesService } from './comments-replies.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { GetRepliesQueryDto } from './dto/get-replies.query.dto';
import type { SessionUser } from '../../auth/services/validate-session.service';

@Controller('comments/:commentId/replies')
export class CommentsRepliesController {
  constructor(
    private readonly service: CommentsRepliesService,
  ) {}

  /**
   * POST /comments/:id/replies
   * - Create reply (WRITE)
   */
  @Post()
  @RateLimit('commentReplyCreate')
  @UseGuards(AccessTokenCookieAuthGuard)
  async createReply(
    @Param('commentId') commentId: string,
    @Body() dto: CreateReplyDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.createReply({
      parentCommentId: commentId,
      authorId: user.userId,
      content: dto.content,
    });
  }

  /**
   * GET /comments/:id/replies
   * - Read replies (READ)
   */
  @Get()
  @RateLimit('commentReplyRead')
  @UseGuards(AccessTokenCookieAuthGuard)
  async getReplies(
    @Param('commentId') commentId: string,
    @Query() query: GetRepliesQueryDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    return this.service.getReplies({
      parentCommentId: commentId,
      viewerUserId: user?.userId ?? null,
      limit: query.limit,
      cursor: query.cursor,
    });
  }
}
