// backend/src/posts/services/post-visibility.service.ts
import { Injectable } from '@nestjs/common';
import { PostVisibilityPolicy } from '../policy/post-visibility.policy';

@Injectable()
export class PostVisibilityService {
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
   * NEW (ADDED)
   * User feed visibility (aggregation-level)
   * =========================================================
   *
   * Decide whether viewer can see posts of target user
   * Fail-soft: user/profile load failure ≠ auth failure
   *
   * NOTE:
   * - Session validity already guaranteed by guard
   * - Redis is authority (not user/profile)
   * - Relationship logic can be extended later
   */
  async resolveUserPostVisibility(params: {
    targetUserId: string;
    viewer: { userId: string } | null;
  }): Promise<{
    canView: boolean;
    scope: 'public' | 'self';
  }> {
    const viewerId = params.viewer?.userId ?? null;

    // Self-view: full access
    if (viewerId && viewerId === params.targetUserId) {
      return {
        canView: true,
        scope: 'self',
      };
    }

    // Default production-safe rule:
    // - viewer authenticated
    // - public posts only
    return {
      canView: true,
      scope: 'public',
    };
  }
}
