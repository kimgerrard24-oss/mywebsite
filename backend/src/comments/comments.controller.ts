import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetPostCommentsQueryDto } from './dto/get-post-comments.query';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SessionUser } from '../auth/services/validate-session.service';

@Controller('posts/:postId/comments')
export class PostCommentsController {
  constructor(
    private readonly service: CommentsService,
  ) {}

  /**
   * =========================
   * POST /posts/:postId/comments
   * =========================
   */
  @Post()
  @UseGuards(AccessTokenCookieAuthGuard)
  async createComment(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: { userId: string; jti: string },
  ) {
    return this.service.createComment({
      postId,
      authorId: user.userId,
      content: dto.content,
    });
  }

  /**
   * =========================
   * GET /posts/:postId/comments
   * =========================
   */
  @Get()
  @UseGuards(AccessTokenCookieAuthGuard)
  async getPostComments(
    @Param('postId') postId: string,
    @Query() query: GetPostCommentsQueryDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    return this.service.getPostComments({
      postId,
      viewerUserId: user?.userId ?? null,
      limit: query.limit,
      cursor: query.cursor,
    });
  }
}
