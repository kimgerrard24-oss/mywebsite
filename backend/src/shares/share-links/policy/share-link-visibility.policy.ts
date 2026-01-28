// backend/src/shares/share-links/policy/share-link-visibility.policy.ts

import {
  PostVisibility,
  VisibilityRuleType,
} from '@prisma/client';

export type ShareLinkDecision =
  | 'OK'
  | 'NOT_FOUND'
  | 'LINK_DISABLED'
  | 'LINK_EXPIRED'
  | 'POST_DELETED'
  | 'POST_HIDDEN'
  | 'BLOCKED'
  | 'VISIBILITY_DENIED'
  | 'ACCOUNT_PRIVATE';

export class ShareLinkVisibilityPolicy {
  static decide(ctx: {
    link: {
      isDisabled: boolean;
      expiresAt: Date | null;
    };
    post: {
      isDeleted: boolean;
      isHidden: boolean;
      visibility: PostVisibility;
    };
    isBlockedEitherWay: boolean;
    isFollower: boolean;
    visibilityRule: VisibilityRuleType | null;
    isAuthorPrivate: boolean;
  }): ShareLinkDecision {
    if (!ctx.link) return 'NOT_FOUND';

    if (ctx.link.isDisabled) return 'LINK_DISABLED';

    if (
      ctx.link.expiresAt &&
      ctx.link.expiresAt < new Date()
    ) {
      return 'LINK_EXPIRED';
    }

    if (ctx.post.isDeleted) return 'POST_DELETED';
    if (ctx.post.isHidden) return 'POST_HIDDEN';
    if (ctx.isBlockedEitherWay) return 'BLOCKED';

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
        return 'VISIBILITY_DENIED';

      case PostVisibility.PRIVATE:
      default:
        return 'ACCOUNT_PRIVATE';
    }
  }
}
