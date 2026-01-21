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
   * EXISTING (DO NOT TOUCH)
   * Post-level visibility
   * =========================================================
   */
  async canViewPost(params: {
    post: any;
    viewer: { userId: string } | null;
  }): Promise<boolean> {
    return PostVisibilityPolicy.canView({
      visibility: params.post.visibility,
      authorId: params.post.authorId,
      viewerId: params.viewer?.userId ?? null,
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
    // Self-view
    // =========================
    if (viewerId && viewerId === params.targetUserId) {
      return {
        canView: true,
        scope: 'self',
      };
    }

    // =========================
    // Load privacy + follow state (DB authority)
    // =========================
    const user = await this.prisma.user.findUnique({
      where: { id: params.targetUserId },
      select: {
        isPrivate: true,
        followers: viewerId
          ? {
              where: { followerId: viewerId },
              select: { followerId: true },
              take: 1,
            }
          : false,
      },
    });

    if (!user) {
      // fail-soft: behave as no content
      return {
        canView: false,
        scope: 'public',
      };
    }

    const isFollower =
      viewerId && Array.isArray(user.followers)
        ? user.followers.length > 0
        : false;

    // =========================
    // Private account gate
    // =========================
    if (user.isPrivate && !isFollower) {
      return {
        canView: false,
        scope: 'public',
      };
    }

    // =========================
    // Public or approved follower
    // =========================
    return {
      canView: true,
      scope: 'public',
    };
  }
}

