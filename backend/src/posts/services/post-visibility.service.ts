// backend/src/posts/services/post-visibility.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PostVisibilityPolicy } from '../policy/post-visibility.policy';

@Injectable()
export class PostVisibilityService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

    /**
   * =========================================================
   * Post-level visibility (backend authority)
   * =========================================================
   */
  async canViewPost(params: {
    post: any;
    viewer: { userId: string } | null;
  }): Promise<boolean> {
    const { post, viewer } = params;

    const visibility = post.visibility;
    const viewerId = viewer?.userId ?? null;
    const authorId = post.authorId;

    // =========================
    // Owner
    // =========================
    const isOwner =
      !!viewerId && viewerId === authorId;

    // =========================
    // Follower (DB authority)
    // =========================
    let isFollower = false;

    if (viewerId && viewerId !== authorId) {
      const follow = await this.prisma.follow.findFirst({
  where: {
    followerId: viewerId,
    followingId: authorId,
  },
  select: { followerId: true },
});


      isFollower = !!follow;
    }

    // =========================
    // CUSTOM visibility rules
    // =========================
    let isIncludedByRule = false;
    let isExcludedByRule = false;

    if (visibility === 'CUSTOM' && viewerId) {
      const rules =
        await this.prisma.postVisibilityRule.findMany({
          where: {
            postId: post.id,
            userId: viewerId,
          },
          select: { rule: true },
        });

      for (const r of rules) {
        if (r.rule === 'INCLUDE') isIncludedByRule = true;
        if (r.rule === 'EXCLUDE') isExcludedByRule = true;
      }
    }

    // =========================
    // Policy (pure business rule)
    // =========================
    return PostVisibilityPolicy.canView({
      visibility,
      isOwner,
      isFollower,
      isIncludedByRule,
      isExcludedByRule,
    });
  }


  /**
   * =========================================================
   * User feed visibility (profile page)
   * =========================================================
   */
  async resolveUserPostVisibility(params: {
    targetUserId: string;
    viewer: { userId: string } | null;
  }): Promise<{
    canView: boolean;
    scope: 'public' | 'self';
  }> {
    const viewerId = params.viewer?.userId ?? null;

    // =========================
    // 1) Self-view
    // =========================
    if (viewerId && viewerId === params.targetUserId) {
      return {
        canView: true,
        scope: 'self',
      };
    }

    // =========================
    // 2) Load privacy (DB authority)
    // =========================
    const user = await this.prisma.user.findUnique({
      where: { id: params.targetUserId },
      select: {
        isPrivate: true,
      },
    });

    if (!user) {
      return {
        canView: false,
        scope: 'public',
      };
    }

    // =========================
    // 3) Private account gate
    // =========================
    if (user.isPrivate) {
      if (!viewerId) {
        return {
          canView: false,
          scope: 'public',
        };
      }

      // 🔒 authority check: follow relation table (explicit)
      const isFollower = await this.prisma.follow.findFirst({
        where: {
          followerId: viewerId,
          followingId: params.targetUserId,
        },
        select: {
          followerId: true, // composite PK, minimal select
        },
      });

      if (!isFollower) {
        return {
          canView: false,
          scope: 'public',
        };
      }

      return {
        canView: true,
        scope: 'self',
      };
    }

    // =========================
    // 4) Public account
    // =========================
    return {
      canView: true,
      scope: 'public',
    };
  }
}




