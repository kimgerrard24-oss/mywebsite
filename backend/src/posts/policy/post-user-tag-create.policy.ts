// backend/src/posts/policy/post-user-tag-create.policy.ts

import { UserTagApprovalMode } from '@prisma/client';

export class PostUserTagCreatePolicy {
  static decideCreateTag(params: {
    actorUserId: string;
    taggedUserId: string;
    isBlockedEitherWay: boolean;
    isFollower: boolean;
    isFollowing: boolean;
    isPrivateAccount: boolean;
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

    if (isBlockedEitherWay) {
      return { allowed: false, autoAccept: false };
    }

    if (isPrivateAccount && !isFollower) {
      return { allowed: false, autoAccept: false };
    }

    if (!setting) {
      return { allowed: true, autoAccept: false };
    }

    if (
      setting.allowFromAnyone ||
      (setting.allowFromFollowers && isFollower) ||
      (setting.allowFromFollowing && isFollowing)
    ) {
      const autoAccept =
        setting.approvalMode === 'AUTO';

      return { allowed: true, autoAccept };
    }

    return { allowed: false, autoAccept: false };
  }
}
