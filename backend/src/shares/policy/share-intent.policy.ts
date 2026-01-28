// backend/src/shares/policy/share-intent.policy.ts

import { PostVisibility, VisibilityRuleType } from '@prisma/client';
import { ShareIntentResultDto } from '../dto/share-intent-result.dto';

export class ShareIntentPolicy {
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
  }): ShareIntentResultDto {
    if (!ctx.post) {
      return {
        canShareInternal: false,
        canShareExternal: false,
        reason: 'NOT_FOUND',
      };
    }

    if (ctx.post.isDeleted) {
      return {
        canShareInternal: false,
        canShareExternal: false,
        reason: 'POST_DELETED',
      };
    }

    if (ctx.post.isHidden) {
      return {
        canShareInternal: false,
        canShareExternal: false,
        reason: 'POST_HIDDEN',
      };
    }

    if (ctx.isBlockedEitherWay) {
      return {
        canShareInternal: false,
        canShareExternal: false,
        reason: 'BLOCKED',
      };
    }

    if (ctx.isOwner) {
      return {
        canShareInternal: true,
        canShareExternal: true,
        reason: 'OK',
      };
    }

    if (ctx.visibilityRule === VisibilityRuleType.EXCLUDE) {
      return {
        canShareInternal: false,
        canShareExternal: false,
        reason: 'VISIBILITY_DENIED',
      };
    }

    switch (ctx.post.visibility) {
      case PostVisibility.PUBLIC:
        return {
          canShareInternal: true,
          canShareExternal: true,
          reason: 'OK',
        };

      case PostVisibility.FOLLOWERS:
        if (!ctx.isFollower) {
          return {
            canShareInternal: false,
            canShareExternal: false,
            reason: 'VISIBILITY_DENIED',
            requireFollow: true,
          };
        }
        return {
          canShareInternal: true,
          canShareExternal: true,
          reason: 'OK',
        };

      case PostVisibility.CUSTOM:
        if (ctx.visibilityRule === VisibilityRuleType.INCLUDE) {
          return {
            canShareInternal: true,
            canShareExternal: false, // 🔥 external share blocked for CUSTOM
            reason: 'OK',
          };
        }
        return {
          canShareInternal: false,
          canShareExternal: false,
          reason: 'VISIBILITY_DENIED',
        };

      case PostVisibility.PRIVATE:
      default:
        return {
          canShareInternal: false,
          canShareExternal: false,
          reason: 'ACCOUNT_PRIVATE',
        };
    }
  }
}
