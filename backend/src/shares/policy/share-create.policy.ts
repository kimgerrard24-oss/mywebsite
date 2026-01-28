// backend/src/shares/policy/share-create.policy.ts

import {
  PostVisibility,
  VisibilityRuleType,
} from '@prisma/client';

export class ShareCreatePolicy {
  static decide(ctx: {
    post: any;
    isOwner: boolean;
    isFollower: boolean;
    isBlockedEitherWay: boolean;
    visibilityRule: VisibilityRuleType | null;
    isAuthorPrivate: boolean;
    isChatMember: boolean;
    targetChatId: string | null;
  }) {
    if (!ctx.post) return 'NOT_FOUND';

    if (ctx.post.isDeleted) return 'POST_DELETED';
    if (ctx.post.isHidden) return 'POST_HIDDEN';
    if (ctx.isBlockedEitherWay) return 'BLOCKED';

    if (ctx.targetChatId && !ctx.isChatMember) {
      return 'NOT_CHAT_MEMBER';
    }

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
        return 'VISIBILITY_DENIED';
    }
  }
}
