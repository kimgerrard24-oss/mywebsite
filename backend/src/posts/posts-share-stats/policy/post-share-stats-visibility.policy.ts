// backend/src/posts/share-stats/policy/post-share-stats-visibility.policy.ts

import {
  PostVisibility,
  VisibilityRuleType,
} from '@prisma/client';

export type PostShareStatsDecision =
  | 'OK'
  | 'NOT_FOUND'
  | 'POST_DELETED'
  | 'POST_HIDDEN'
  | 'BLOCKED'
  | 'VISIBILITY_DENIED'
  | 'ACCOUNT_PRIVATE';

export class PostShareStatsVisibilityPolicy {
  static decide(ctx: {
    post: {
      isDeleted: boolean;
      isHidden: boolean;
      visibility: PostVisibility;
    };
    isOwner: boolean;
    isFollower: boolean;
    isBlockedEitherWay: boolean;
    visibilityRule: VisibilityRuleType | null;
    isAuthorPrivate: boolean;
  }): PostShareStatsDecision {
    if (!ctx.post) return 'NOT_FOUND';
    if (ctx.post.isDeleted) return 'POST_DELETED';
    if (ctx.post.isHidden) return 'POST_HIDDEN';
    if (ctx.isBlockedEitherWay) return 'BLOCKED';

    if (ctx.isOwner) return 'OK';

    if (ctx.visibilityRule === VisibilityRuleType.EXCLUDE) {
      return 'VISIBILITY_DENIED';
    }

    switch (ctx.post.visibility) {
      case PostVisibility.PUBLIC:
        return 'OK';

      case PostVisibility.FOLLOWERS:
        return ctx.isFollower
          ? 'OK'
          : 'VISIBILITY_DENIED';

      case PostVisibility.CUSTOM:
        return ctx.visibilityRule ===
          VisibilityRuleType.INCLUDE
          ? 'OK'
          : 'VISIBILITY_DENIED';

      case PostVisibility.PRIVATE:
      default:
        return 'ACCOUNT_PRIVATE';
    }
  }
}
