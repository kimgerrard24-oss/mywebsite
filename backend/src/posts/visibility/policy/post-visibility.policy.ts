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

    // ===== relation =====
    isFollower: boolean;

    // ===== post-level visibility =====
    postVisibility?: PostVisibility;
    visibilityRule?: VisibilityRuleType | null;

    // ===== security =====
    isBlockedEitherWay: boolean;
  }): PostVisibilityDecision {
    const {
      postExists,
      isDeleted,
      isHidden,
      isOwner,
      isFollower,
      postVisibility,
      visibilityRule,
      isBlockedEitherWay,
    } = params;

    // =================================================
    // Decision Order (High → Low Priority)
    // =================================================

    // 1) Not found
    if (!postExists) {
      return { canView: false, reason: 'NOT_FOUND' };
    }

    // 2) System states
    if (isDeleted) {
      return { canView: false, reason: 'POST_DELETED' };
    }

    if (isHidden) {
      return { canView: false, reason: 'POST_HIDDEN' };
    }

    // 3) Security
    if (isBlockedEitherWay) {
      return { canView: false, reason: 'BLOCKED' };
    }

    // 4) Owner always allowed
    if (isOwner) {
      return { canView: true, reason: 'OWNER' };
    }

    // =================================================
    // Custom rules (override post visibility)
    // =================================================

    // EXCLUDE always deny
    if (visibilityRule === VisibilityRuleType.EXCLUDE) {
      return { canView: false, reason: 'EXCLUDED' };
    }

    // INCLUDE always allow
    if (visibilityRule === VisibilityRuleType.INCLUDE) {
      return { canView: true, reason: 'OK' };
    }

    // =================================================
    // Post-level visibility authority
    // =================================================

    const visibility =
      postVisibility ?? PostVisibility.PUBLIC;

    switch (visibility) {
      case PostVisibility.PUBLIC: {
        return { canView: true, reason: 'OK' };
      }

      case PostVisibility.FOLLOWERS: {
        if (!isFollower) {
          return {
            canView: false,
            reason: 'NOT_FOLLOWER',
          };
        }
        return { canView: true, reason: 'OK' };
      }

      case PostVisibility.PRIVATE: {
        // owner already handled above
        return {
          canView: false,
          reason: 'PRIVATE_POST',
        };
      }

      case PostVisibility.CUSTOM: {
        // no rule matched → deny
        return {
          canView: false,
          reason: 'NOT_IN_CUSTOM_LIST',
        };
      }

      default: {
        // fail-safe
        return {
          canView: false,
          reason: 'VISIBILITY_DENIED',
        };
      }
    }
  }
}
