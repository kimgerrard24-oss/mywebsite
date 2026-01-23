// backend/src/posts/policy/post-visibility.policy.ts

import { PostVisibility } from '@prisma/client';

export class PostVisibilityPolicy {
  static canView(params: {
    visibility: PostVisibility;
    isOwner: boolean;
    isFollower: boolean;
    isIncludedByRule: boolean;
    isExcludedByRule: boolean;
  }): boolean {
    const {
      visibility,
      isOwner,
      isFollower,
      isIncludedByRule,
      isExcludedByRule,
    } = params;

    // ❌ EXCLUDE always deny (even owner exception is handled before policy)
    if (isExcludedByRule) {
      return false;
    }

    // ✅ owner always allowed
    if (isOwner) {
      return true;
    }

    switch (visibility) {
      case PostVisibility.PUBLIC:
        return true;

      case PostVisibility.FOLLOWERS:
        return isFollower;

      case PostVisibility.PRIVATE:
        return false; // owner handled above

      case PostVisibility.CUSTOM:
        return isIncludedByRule;

      default:
        return false;
    }
  }
}
