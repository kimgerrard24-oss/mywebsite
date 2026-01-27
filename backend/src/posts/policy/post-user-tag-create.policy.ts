// backend/src/posts/policy/post-user-tag-create.policy.ts

import { UserTagApprovalMode } from '@prisma/client';

export type PostUserTagCreateDecisionReason =
  | 'BLOCKED'
  | 'TAG_DISABLED'
  | 'FOLLOWERS_ONLY'
  | 'FOLLOWING_ONLY';

export class PostUserTagCreatePolicy {
  static decideCreateTag(params: {
    actorUserId: string;
    taggedUserId: string;

    // relations
    isBlockedEitherWay: boolean;

    // actor -> target
    isFollower: boolean;

    // target -> actor
    isFollowing: boolean;

    // privacy
    isPrivateAccount: boolean;

    // user setting
    setting: {
      approvalMode: UserTagApprovalMode;
      allowFromFollowers: boolean;
      allowFromFollowing: boolean;
      allowFromAnyone: boolean;
    } | null;
  }): {
    allowed: boolean;
    autoAccept: boolean;

    /**
     * ❗ UX reason (for frontend feedback only)
     * backend authority still based on allowed flag
     */
    reason?: PostUserTagCreateDecisionReason;
  } {
    const {
      isBlockedEitherWay,
      isFollower,
      isFollowing,
      setting,
    } = params;

    // =================================================
    // 1) HARD BLOCK (absolute deny)
    // =================================================
    if (isBlockedEitherWay) {
      return {
        allowed: false,
        autoAccept: false,
        reason: 'BLOCKED',
      };
    }

   // =================================================
// 2) DEFAULT BEHAVIOR (no custom setting)
// =================================================
// 🔥 HARDEN: no setting = no permission to tag
if (!setting) {
  return {
    allowed: false,
    autoAccept: false,
    reason: 'TAG_DISABLED',
  };
}


    // =================================================
    // 3) SETTING-BASED PERMISSION (who can tag)
    // =================================================
    let allowed = false;
    let denyReason: PostUserTagCreateDecisionReason | undefined;

    if (setting.allowFromAnyone) {
      allowed = true;
    } else if (setting.allowFromFollowers && isFollower) {
      // actor follows target
      allowed = true;
    } else if (setting.allowFromFollowing && isFollowing) {
      // target follows actor
      allowed = true;
    } else {
      // ❗ not allowed by setting
      if (
        !setting.allowFromAnyone &&
        !setting.allowFromFollowers &&
        !setting.allowFromFollowing
      ) {
        denyReason = 'TAG_DISABLED';
      } else if (setting.allowFromFollowers && !isFollower) {
        denyReason = 'FOLLOWERS_ONLY';
      } else if (setting.allowFromFollowing && !isFollowing) {
        denyReason = 'FOLLOWING_ONLY';
      } else {
        denyReason = 'TAG_DISABLED';
      }
    }

    if (!allowed) {
      return {
        allowed: false,
        autoAccept: false,
        reason: denyReason,
      };
    }

    // =================================================
    // 4) AUTO ACCEPT RULE
    // =================================================
    // PhlyPhant production rule:
    // - tag must NOT be visible until tagged user accepts
    // - even if approvalMode === 'AUTO'
    // - autoAccept is disabled to enforce backend authority
    return {
      allowed: true,
      autoAccept: false,
    };
  }
}
