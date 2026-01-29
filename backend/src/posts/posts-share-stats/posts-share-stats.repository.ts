// backend/src/posts/share-stats/posts-share-stats.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VisibilityRuleType } from '@prisma/client';

@Injectable()
export class PostsShareStatsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async loadContext(params: {
    postId: string;
    viewerUserId: string;
  }) {
    const { postId, viewerUserId } = params;

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
          where: { userId: viewerUserId },
          select: { rule: true },
          take: 1,
        },
      },
    });

    if (!post) {
      return { post: null as any };
    }

    const [block1, block2, follow, stats] =
      await Promise.all([
        this.prisma.userBlock.findFirst({
          where: {
            blockerId: viewerUserId,
            blockedId: post.authorId,
          },
          select: { blockerId: true },
        }),
        this.prisma.userBlock.findFirst({
          where: {
            blockerId: post.authorId,
            blockedId: viewerUserId,
          },
          select: { blockerId: true },
        }),
        this.prisma.follow.findFirst({
          where: {
            followerId: viewerUserId,
            followingId: post.authorId,
          },
          select: { followerId: true },
        }),
        this.prisma.postShareStat.findUnique({
          where: { postId },
          select: {
            internalShareCount: true,
            externalShareCount: true,
            updatedAt: true,
          },
        }),
      ]);

    return {
      post,
      isOwner: post.authorId === viewerUserId,
      isFollower: !!follow,
      isBlockedEitherWay: !!block1 || !!block2,
      visibilityRule:
        post.visibilityRules[0]?.rule ?? null,
      stats,
    };
  }
}

