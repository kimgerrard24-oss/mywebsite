// backend/src/posts/visibility/posts-visibility.service.ts

import { Injectable } from '@nestjs/common';
import { PostsVisibilityRepository } from './posts-visibility.repository';
import { PostVisibilityPolicy } from './policy/post-visibility.policy';
import { PostVisibilityDecision } from './types/post-visibility.types';

@Injectable()
export class PostsVisibilityService {
  constructor(
    private readonly repo: PostsVisibilityRepository,
  ) {}

  async validateVisibility(params: {
    postId: string;
    viewerUserId: string | null;
  }): Promise<PostVisibilityDecision> {
    const { postId, viewerUserId } = params;

    const ctx = await this.repo.loadPostVisibilityContext({
      postId,
      viewerUserId,
    });

    if (!ctx.post) {
      return { canView: false, reason: 'NOT_FOUND' };
    }

    const isOwner =
      viewerUserId !== null &&
      ctx.post.authorId === viewerUserId;

    return PostVisibilityPolicy.decide({
  postExists: true,
  isDeleted: ctx.post.isDeleted,
  isHidden: ctx.post.isHidden,

  isOwner,
  isPrivateAccount: ctx.post.author.isPrivate,
  isFollower: ctx.isFollower,

  postVisibility: ctx.post.visibility,
  visibilityRule: ctx.visibilityRule,

  isBlockedEitherWay: ctx.isBlockedEitherWay,
});

  }

    /**
   * =========================================================
   * User feed visibility (profile page)
   * Account-level visibility gate (backend authority)
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
    const user = await this.repo.findUserPrivacy({
      userId: params.targetUserId,
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

      const isFollower = await this.repo.isFollower({
        followerId: viewerId,
        followingId: params.targetUserId,
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
