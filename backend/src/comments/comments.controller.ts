// backend/src/comments/comment.controller.ts
import {
  Body,
  Controller,
  Param,
  Get,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetPostCommentsQueryDto } from './dto/get-post-comments.query';
import type { SessionUser } from '../auth/services/validate-session.service';

@Controller('posts/:id/comments')
export class CommentsController {
  constructor(
    private readonly service: CommentsService,
  ) {}

  @Post()
  @UseGuards(AccessTokenCookieAuthGuard)
  async createComment(
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: { userId: string; jti: string },
  ) {
    return this.service.createComment({
      postId,
      authorId: user.userId,
      content: dto.content,
    });
  }

  @Get()
  @UseGuards(AccessTokenCookieAuthGuard)
  async getPostComments(
    @Param('id') postId: string,
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

