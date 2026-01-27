// backend/src/moderation/user/user-moderation.controller.ts

import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { SessionUser } from '../../auth/services/validate-session.service';
import { UserModeratedCommentDto } from './dto/user-moderated-comment.dto';
import { UserModeratedMessageDto } from './dto/user-moderated-message.dto';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

import { UserModerationService } from './user-moderation.service';
import { UserModeratedPostDto } from './dto/user-moderated-post.dto';

@Controller('moderation/me')
@UseGuards(AccessTokenCookieAuthGuard)
export class UserModerationController {
  constructor(
    private readonly service: UserModerationService,
  ) {}

  /**
   * GET /moderation/me/posts/:id
   * User moderation notice / appeal context (POST)
   */
  @Get('posts/:id')
  @RateLimit('userModerationRead')
  async getMyModeratedPost(
    @Param('id') postId: string,
    @CurrentUser() user: SessionUser,
  ): Promise<UserModeratedPostDto> {
    return this.service.getModeratedPostDetail(
      user.userId,
      postId,
    );
  }

   /**
   * GET /moderation/me/comments/:id
   * User moderation notice / appeal context (COMMENT)
   */
  @Get('comments/:id')
  @RateLimit('userModerationRead')
  async getMyModeratedComment(
    @Param('id') commentId: string,
    @CurrentUser() user: SessionUser,
  ): Promise<UserModeratedCommentDto> {
    return this.service.getModeratedCommentDetail(
      user.userId,
      commentId,
    );
  }

  // =========================================
  // GET /moderation/me/messages/:id
  // =========================================
  @Get('messages/:id')
  @RateLimit('userModerationRead')
  async getModeratedMessage(
    @CurrentUser() user: SessionUser,
    @Param('id') id: string,
  ): Promise<UserModeratedMessageDto> {
    return this.service.getModeratedMessageForUser(
      user.userId,
      id,
    );
  }
}
