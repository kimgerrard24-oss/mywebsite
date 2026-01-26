// backend/src/posts/policy/post-user-tag-create.policy.ts

import { UserTagApprovalMode } from '@prisma/client';

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
  } {
    const {
      isBlockedEitherWay,
      isFollower,
      isFollowing,
      isPrivateAccount,
      setting,
    } = params;

    // =================================================
    // 1) HARD BLOCK (absolute deny)
    // =================================================
    if (isBlockedEitherWay) {
      return { allowed: false, autoAccept: false };
    }

    // =================================================
    // 2) DEFAULT BEHAVIOR (no custom setting)
    // =================================================
    // Production social behavior:
    // - allow tag
    // - private account => require approval
    if (!setting) {
      return {
        allowed: true,
        autoAccept: !isPrivateAccount,
      };
    }

    // =================================================
    // 3) SETTING-BASED PERMISSION
    // =================================================
    let allowed = false;

    if (setting.allowFromAnyone) {
      allowed = true;
    } else if (setting.allowFromFollowers && isFollower) {
      // actor follows target
      allowed = true;
    } else if (setting.allowFromFollowing && isFollowing) {
      // target follows actor
      allowed = true;
    }

    if (!allowed) {
      return { allowed: false, autoAccept: false };
    }

    // =================================================
    // 4) AUTO ACCEPT RULE
    // =================================================
    // Even if allowed:
    // - private account should still require approval
    // - unless user explicitly set AUTO and account is public
    let autoAccept = false;

    if (
      setting.approvalMode === 'AUTO' &&
      !isPrivateAccount
    ) {
      autoAccept = true;
    }

    return { allowed: true, autoAccept };
  }
}
