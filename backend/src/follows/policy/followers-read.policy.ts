// backend/src/follows/policy/followers-read.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class FollowersReadPolicy {
  static assertCanReadFollowers(params: {
    isPrivate: boolean;
    isSelf: boolean;
    isFollowing: boolean;
    isBlockedByTarget: boolean;
    hasBlockedTarget: boolean;
  }) {
    const {
      isPrivate,
      isSelf,
      isFollowing,
      isBlockedByTarget,
      hasBlockedTarget,
    } = params;

    // =========================
    // 🔒 BLOCK = hard deny
    // =========================
    if (isBlockedByTarget || hasBlockedTarget) {
      throw new ForbiddenException('CANNOT_VIEW_FOLLOWERS');
    }

    // =========================
    // 🔐 PRIVATE ACCOUNT RULE
    // =========================
    if (isPrivate && !isSelf && !isFollowing) {
      throw new ForbiddenException('PRIVATE_ACCOUNT');
    }

    // otherwise allowed
  }
}

