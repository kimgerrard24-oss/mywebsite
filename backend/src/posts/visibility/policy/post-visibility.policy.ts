// backend/src/posts/visibility/policy/post-visibility.policy.ts

import { PostVisibilityDecision } from '../types/post-visibility.types';

export class PostVisibilityPolicy {
  static decide(params: {
    postExists: boolean;
    isDeleted: boolean;
    isHidden: boolean;
    isOwner: boolean;
    isPrivateAccount: boolean;
    isFollower: boolean;
    isBlockedEitherWay: boolean;
  }): PostVisibilityDecision {
    if (!params.postExists) {
      return { canView: false, reason: 'NOT_FOUND' };
    }

    if (params.isDeleted) {
      return { canView: false, reason: 'POST_DELETED' };
    }

    if (params.isHidden && !params.isOwner) {
      return { canView: false, reason: 'POST_HIDDEN' };
    }

    if (params.isBlockedEitherWay) {
      return { canView: false, reason: 'BLOCKED' };
    }

    if (params.isPrivateAccount && !params.isOwner && !params.isFollower) {
      return { canView: false, reason: 'NOT_FOLLOWER' };
    }

    return { canView: true, reason: 'OK' };
  }
}
