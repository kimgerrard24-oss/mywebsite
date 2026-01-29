// backend/src/shares/shares.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisibilityRuleType } from '@prisma/client';

@Injectable()
export class SharesRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async loadContext(params: {
    postId: string;
    actorUserId: string;
    targetUserId: string | null;
    targetChatId: string | null;
  }) {
    const { postId, actorUserId, targetUserId, targetChatId } =
      params;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        isDeleted: true,
        isHidden: true,
        visibility: true,
        author: {
          select: { isPrivate: true },
        },
        visibilityRules: {
          where: { userId: actorUserId },
          select: { rule: true },
          take: 1,
        },
      },
    });

    if (!post) return { post: null };

    const [block1, block2, follow] = await Promise.all([
      this.prisma.userBlock.findFirst({
        where: {
          blockerId: actorUserId,
          blockedId: post.authorId,
        },
        select: { blockerId: true },
      }),
      this.prisma.userBlock.findFirst({
        where: {
          blockerId: post.authorId,
          blockedId: actorUserId,
        },
        select: { blockerId: true },
      }),
      this.prisma.follow.findFirst({
        where: {
          followerId: actorUserId,
          followingId: post.authorId,
        },
        select: { followerId: true },
      }),
    ]);

    let chatParticipant = null;

    if (targetChatId) {
      chatParticipant =
        await this.prisma.chatParticipant.findUnique({
          where: {
            chatId_userId: {
              chatId: targetChatId,
              userId: actorUserId,
            },
          },
          select: { chatId: true },
        });
    }

    return {
      post,
      isOwner: post.authorId === actorUserId,
      isFollower: !!follow,
      isBlockedEitherWay: !!block1 || !!block2,
      visibilityRule:
        post.visibilityRules[0]?.rule ??
        null,
      isAuthorPrivate: post.author.isPrivate,
      isChatMember: !!chatParticipant,
    };
  }

  async createShare(params: {
    postId: string;
    senderId: string;
    targetUserId: string | null;
    targetChatId: string | null;
  }) {
    return this.prisma.share.create({
      data: {
        postId: params.postId,
        senderId: params.senderId,
        targetUserId: params.targetUserId,
        targetChatId: params.targetChatId,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  }

  attachChatMessage(params: {
  shareId: string;
  chatMessageId: string;
}) {
  return this.prisma.share.update({
    where: { id: params.shareId },
    data: { chatMessageId: params.chatMessageId },
  });
}

}
