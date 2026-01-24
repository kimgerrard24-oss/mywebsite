// backend/src/posts/visibility/repositories/posts-visibility.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VisibilityRuleType } from '@prisma/client';

@Injectable()
export class PostsVisibilityRepository {
  constructor(private readonly prisma: PrismaService) {}

 async loadPostVisibilityContext(params: {
  postId: string;
  viewerUserId: string | null;
}) {
  const { postId, viewerUserId } = params;

  const post = await this.prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
      isDeleted: true,
      isHidden: true,

      // ===== post-level visibility =====
      visibility: true,

      // ===== custom visibility rules (viewer-specific) =====
      visibilityRules: viewerUserId
        ? {
            where: { userId: viewerUserId },
            select: { rule: true },
          }
        : false,
    },
  });

  if (!post) {
    return {
      post: null,
      isFollower: false,
      isBlockedEitherWay: false,
      visibilityRule: null as VisibilityRuleType | null,
    };
  }

  let isFollower = false;
  let isBlockedEitherWay = false;

  if (viewerUserId) {
    const [follow, block] = await Promise.all([
      this.prisma.follow.findFirst({
        where: {
          followerId: viewerUserId,
          followingId: post.authorId,
        },
        select: { followerId: true },
      }),

      this.prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: viewerUserId, blockedId: post.authorId },
            { blockerId: post.authorId, blockedId: viewerUserId },
          ],
        },
        select: { blockerId: true },
      }),
    ]);

    isFollower = Boolean(follow);
    isBlockedEitherWay = Boolean(block);
  }

  const visibilityRule =
    viewerUserId && Array.isArray(post.visibilityRules)
      ? post.visibilityRules[0]?.rule ?? null
      : null;

  return {
    post: {
      id: post.id,
      authorId: post.authorId,
      isDeleted: post.isDeleted,
      isHidden: post.isHidden,
      visibility: post.visibility,
    },
    isFollower,
    isBlockedEitherWay,
    visibilityRule, // INCLUDE | EXCLUDE | null
  };
}


    // =================================================
  // Account-level privacy (profile visibility gate)
  // =================================================
  async findUserPrivacy(params: { userId: string }) {
    return this.prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        isPrivate: true,
      },
    });
  }

  async isFollower(params: {
    followerId: string;
    followingId: string;
  }): Promise<boolean> {
    const row = await this.prisma.follow.findFirst({
      where: {
        followerId: params.followerId,
        followingId: params.followingId,
      },
      select: {
        followerId: true, // minimal select (PK)
      },
    });

    return Boolean(row);
  }

}
