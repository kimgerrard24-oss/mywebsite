// backend/src/moderation/user/user-moderation.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AppealStatus,
  ModerationTargetType,
} from '@prisma/client';
import type { ModerationSummary } from './types/moderation.types';

@Injectable()
export class UserModerationRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findPostForOwner(postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        content: true,
        isHidden: true,
        isDeleted: true,
        createdAt: true,
      },
    });
  }

  async findLatestModerationActionForPost(
    postId: string,
  ): Promise<ModerationSummary | null> {
    return this.prisma.moderationAction.findFirst({
      where: {
        targetType: ModerationTargetType.POST,
        targetId: postId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        actionType: true,
        reason: true,
        createdAt: true,
      },
    });
  }

    async findCommentForOwner(commentId: string) {
    return this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        postId: true,
        authorId: true,
        content: true,
        isHidden: true,
        isDeleted: true,
        createdAt: true,
      },
    });
  }

  async findLatestModerationActionForComment(
    commentId: string,
  ): Promise<ModerationSummary | null> {
    return this.prisma.moderationAction.findFirst({
      where: {
        targetType: ModerationTargetType.COMMENT,
        targetId: commentId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        actionType: true,
        reason: true,
        createdAt: true,
      },
    });
  }

  async hasPendingAppeal(
    userId: string,
    moderationActionId: string,
  ): Promise<boolean> {
    const appeal = await this.prisma.appeal.findFirst({
      where: {
        userId,
        moderationActionId,
        status: AppealStatus.PENDING,
        withdrawnAt: null,
      },
      select: { id: true },
    });

    return !!appeal;
  }

   // ================= POST / COMMENT (ของเดิม) =================
  // ... ของคุณมีอยู่แล้ว

  // ================= CHAT MESSAGE =================

  async findMessageWithChat(
    messageId: string,
  ) {
    return this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        content: true,
        isDeleted: true,
        createdAt: true,
        senderId: true,
        chatId: true,
      },
    });
  }

  async isChatParticipant(
    chatId: string,
    userId: string,
  ): Promise<boolean> {
    const row =
      await this.prisma.chatParticipant.findUnique(
        {
          where: {
            chatId_userId: {
              chatId,
              userId,
            },
          },
          select: { chatId: true },
        },
      );

    return !!row;
  }

  async findLatestModerationActionForMessage(
    messageId: string,
  ): Promise<ModerationSummary | null> {
    return this.prisma.moderationAction.findFirst({
      where: {
        targetType:
          ModerationTargetType.CHAT_MESSAGE,
        targetId: messageId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        actionType: true,
        reason: true,
        createdAt: true,
      },
    });
  }

}
