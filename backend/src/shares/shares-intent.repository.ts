// backend/src/shares/shares-intent.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisibilityRuleType, PostVisibility } from '@prisma/client';

@Injectable()
export class SharesIntentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async loadContext(params: {
    postId: string;
    actorUserId: string;
  }) {
    const { postId, actorUserId } = params;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        isDeleted: true,
        isHidden: true,
        visibility: true,
        author: {
          select: {
            id: true,
            isPrivate: true,
          },
        },
        visibilityRules: {
          where: {
            userId: actorUserId,
          },
          select: {
            rule: true,
          },
          take: 1,
        },
      },
    });

    if (!post) {
      return { post: null as any };
    }

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

    return {
      post,
      isOwner: post.authorId === actorUserId,
      isFollower: !!follow,
      isBlockedEitherWay: !!block1 || !!block2,
      visibilityRule:
        post.visibilityRules[0]?.rule ?? null,
      isAuthorPrivate: post.author.isPrivate,
    };
  }
}
