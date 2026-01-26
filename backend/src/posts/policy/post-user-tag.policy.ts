// backend/src/posts/policy/post-user-tag.policy.ts

import {
  UserTagApprovalMode,
  UserTagSetting,
} from '@prisma/client';

export class PostUserTagPolicy {
  /**
   * =================================================
   * Decide whether actor can tag user in a post
   * =================================================
   *
   * FINAL AUTHORITY — no DB access here
   */
  static decideCreateTag(params: {
    actorUserId: string;
    taggedUserId: string;

    isBlockedEitherWay: boolean;

    // relations
    isFollower: boolean;   // actor → target
    isFollowing: boolean; // target → actor

    // privacy
    isPrivateAccount: boolean;

    // tag setting (nullable → default MANUAL)
    setting: UserTagSetting | null;
  }): {
    allowed: boolean;
    autoAccept: boolean;
    reason?: string;
  } {
    const {
      isBlockedEitherWay,
      isFollower,
      isFollowing,
      isPrivateAccount,
      setting,
    } = params;

    /**
     * =================================================
     * 1) BLOCK — absolute deny
     * =================================================
     */
    if (isBlockedEitherWay) {
      return {
        allowed: false,
        autoAccept: false,
        reason: 'BLOCKED',
      };
    }

    /**
     * =================================================
     * 2) Resolve effective tag setting
     * =================================================
     */
    const approvalMode =
      setting?.approvalMode ?? UserTagApprovalMode.MANUAL;

    const allowFromFollowers =
      setting?.allowFromFollowers ?? true;

    const allowFromFollowing =
      setting?.allowFromFollowing ?? true;

    const allowFromAnyone =
      setting?.allowFromAnyone ?? false;

    /**
     * =================================================
     * 3) DISABLED — deny all
     * =================================================
     */
    if (approvalMode === UserTagApprovalMode.DISABLED) {
      return {
        allowed: false,
        autoAccept: false,
        reason: 'TAG_DISABLED',
      };
    }

    /**
     * =================================================
     * 4) Relationship permission
     * =================================================
     */
    let relationAllowed = false;

    if (isFollower && allowFromFollowers) {
      relationAllowed = true;
    }

    if (isFollowing && allowFromFollowing) {
      relationAllowed = true;
    }

    if (allowFromAnyone) {
      relationAllowed = true;
    }

    if (!relationAllowed) {
      return {
        allowed: false,
        autoAccept: false,
        reason: 'RELATION_NOT_ALLOWED',
      };
    }

    /**
     * =================================================
     * 5) Private account hardening
     * =================================================
     *
     * Even if allowFromAnyone = true,
     * private account should not auto-accept
     */
    const forceManualBecausePrivate =
      isPrivateAccount === true;

    /**
     * =================================================
     * 6) Auto accept or pending
     * =================================================
     */
    if (
      approvalMode === UserTagApprovalMode.AUTO &&
      !forceManualBecausePrivate
    ) {
      return {
        allowed: true,
        autoAccept: true,
      };
    }

    // MANUAL or forced manual
    return {
      allowed: true,
      autoAccept: false,
    };
  }
}
