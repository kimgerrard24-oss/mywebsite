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

      // approved follower → full profile feed
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




