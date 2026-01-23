// backend/src/posts/visibility/policy/post-visibility.policy.ts

import { PostVisibilityDecision } from '../types/post-visibility.types';
import { PostVisibility, VisibilityRuleType } from '@prisma/client';

export class PostVisibilityPolicy {
  static decide(params: {
    postExists: boolean;
    isDeleted: boolean;
    isHidden: boolean;

    // ===== identity =====
    isOwner: boolean;

    // ===== account-level privacy =====
    isPrivateAccount: boolean;
    isFollower: boolean;

    // ===== post-level visibility =====
    postVisibility?: PostVisibility;
    visibilityRule?: VisibilityRuleType | null;

    // ===== security =====
    isBlockedEitherWay: boolean;
  }): PostVisibilityDecision {
    // =================================================
    // 1) Existence
    // =================================================
    if (!params.postExists) {
      return { canView: false, reason: 'NOT_FOUND' };
    }

    // =================================================
    // 2) Hard system states
    // =================================================
    if (params.isDeleted) {
      return { canView: false, reason: 'POST_DELETED' };
    }

    if (params.isHidden && !params.isOwner) {
      return { canView: false, reason: 'POST_HIDDEN' };
    }

    if (params.isBlockedEitherWay) {
      return { canView: false, reason: 'BLOCKED' };
    }

    // =================================================
    // 3) Owner always allowed (after system guards)
    // =================================================
    if (params.isOwner) {
      return { canView: true, reason: 'OWNER' };
    }

    // =================================================
    // 4) Post-level visibility authority
    // =================================================
    const visibility = params.postVisibility ?? PostVisibility.PUBLIC;

    // ❗ EXCLUDE rule overrides everything (except owner handled above)
    if (params.visibilityRule === VisibilityRuleType.EXCLUDE) {
      return { canView: false, reason: 'EXCLUDED' };
    }

    switch (visibility) {
      case PostVisibility.PUBLIC: {
        // pass to account-level privacy
        break;
      }

      case PostVisibility.FOLLOWERS: {
        if (!params.isFollower) {
          return { canView: false, reason: 'NOT_FOLLOWER' };
        }
        break;
      }

      case PostVisibility.PRIVATE: {
        // only owner allowed (already returned above)
        return { canView: false, reason: 'PRIVATE_POST' };
      }

      case PostVisibility.CUSTOM: {
        if (params.visibilityRule === VisibilityRuleType.INCLUDE) {
          break;
        }
        return { canView: false, reason: 'NOT_IN_CUSTOM_LIST' };
      }

      default: {
        // fail-safe
        return { canView: false, reason: 'VISIBILITY_DENIED' };
      }
    }

    // =================================================
    // 5) Account-level privacy (existing behavior)
    // =================================================
    if (params.isPrivateAccount && !params.isFollower) {
      return { canView: false, reason: 'PRIVATE_ACCOUNT' };
    }

    // =================================================
    // 6) Allowed
    // =================================================
    return { canView: true, reason: 'OK' };
  }
}
