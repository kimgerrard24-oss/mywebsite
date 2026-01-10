// backend/src/moderation/user/user-moderation.service.ts

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ModerationTargetType } from '@prisma/client';
import { UserModerationRepository } from './user-moderation.repository';
import { UserModeratedPostDto } from './dto/user-moderated-post.dto';
import { UserModeratedCommentDto } from './dto/user-moderated-comment.dto';
import { UserModeratedMessageDto } from './dto/user-moderated-message.dto';

@Injectable()
export class UserModerationService {
  constructor(
    private readonly repo: UserModerationRepository,
  ) {}

  async getModeratedPostDetail(
    userId: string,
    postId: string,
  ): Promise<UserModeratedPostDto> {
    /**
     * 1️⃣ Load post (DB = authority)
     */
    const post =
      await this.repo.findPostForOwner(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException();
    }

    /**
     * 2️⃣ Load latest moderation action
     */
    const moderation =
      await this.repo.findLatestModerationActionForPost(
        postId,
      );

    /**
     * 3️⃣ Check appeal eligibility
     */
    let canAppeal = false;

    if (moderation) {
      const hasPending =
        await this.repo.hasPendingAppeal(
          userId,
          moderation.id,
        );
      canAppeal = !hasPending;
    }

    return {
      post: {
        id: post.id,
        content: post.content,
        isHidden: post.isHidden,
        isDeleted: post.isDeleted,
        createdAt: post.createdAt,
      },
      moderation: moderation
        ? {
            actionType: moderation.actionType,
            reason: moderation.reason,
            createdAt: moderation.createdAt,
          }
        : null,
      canAppeal,
    };
  }

   async getModeratedCommentDetail(
    userId: string,
    commentId: string,
  ): Promise<UserModeratedCommentDto> {
    /**
     * 1️⃣ Load comment (DB = authority)
     */
    const comment =
      await this.repo.findCommentForOwner(commentId);

    if (!comment) {
      throw new NotFoundException(
        'Comment not found',
      );
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException();
    }

    /**
     * 2️⃣ Load latest moderation action
     */
    const moderation =
      await this.repo.findLatestModerationActionForComment(
        commentId,
      );

    /**
     * 3️⃣ Check appeal eligibility
     */
    let canAppeal = false;

    if (moderation) {
      const hasPending =
        await this.repo.hasPendingAppeal(
          userId,
          moderation.id,
        );
      canAppeal = !hasPending;
    }

    return {
      comment: {
        id: comment.id,
        postId: comment.postId,
        content: comment.content,
        isHidden: comment.isHidden,
        isDeleted: comment.isDeleted,
        createdAt: comment.createdAt,
      },
      moderation: moderation
        ? {
            actionType: moderation.actionType,
            reason: moderation.reason,
            createdAt: moderation.createdAt,
          }
        : null,
      canAppeal,
    };
  }

  // ==================================================
  // GET /moderation/me/messages/:id
  // ==================================================
  async getModeratedMessageForUser(
    userId: string,
    messageId: string,
  ): Promise<UserModeratedMessageDto> {
    const msg =
      await this.repo.findMessageWithChat(
        messageId,
      );

    if (!msg) {
      throw new NotFoundException(
        'Message not found',
      );
    }

    const isOwner =
      msg.senderId === userId;

    let isParticipant = false;

    if (!isOwner) {
      isParticipant =
        await this.repo.isChatParticipant(
          msg.chatId,
          userId,
        );
    }

    if (!isOwner && !isParticipant) {
      throw new ForbiddenException();
    }

    const moderation =
      await this.repo.findLatestModerationActionForMessage(
        messageId,
      );

    let hasPendingAppeal = false;

    if (moderation) {
      hasPendingAppeal =
        await this.repo.hasPendingAppeal(
          userId,
          moderation.id,
        );
    }

    return {
      id: msg.id,
      content: msg.isDeleted
        ? null
        : msg.content,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
      moderation: moderation
        ? {
            actionType:
              moderation.actionType,
            reason: moderation.reason,
            createdAt:
              moderation.createdAt,
          }
        : null,
      hasPendingAppeal,
    };
  }
}
