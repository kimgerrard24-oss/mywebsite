// backend/src/following/policy/following-read.policy.ts
import { ForbiddenException } from '@nestjs/common';

export class FollowingReadPolicy {
  /**
   * Policy for reading "following" list of a user
   *
   * IMPORTANT:
   * - Policy must NOT query DB
   * - All relation state must be pre-calculated by repository
   * - Backend is authority
   */
  static assertCanReadFollowing(params: {
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
    // BLOCK RULE (highest priority)
    // =========================

    if (isBlockedByTarget) {
      throw new ForbiddenException(
        'BLOCKED_BY_USER',
      );
    }

    if (hasBlockedTarget) {
      throw new ForbiddenException(
        'YOU_BLOCKED_USER',
      );
    }

    // =========================
    // PRIVATE ACCOUNT RULE
    // =========================

    if (isPrivate && !isSelf && !isFollowing) {
      throw new ForbiddenException(
        'PRIVATE_ACCOUNT',
      );
    }

    // =========================
    // Otherwise allowed
    // =========================
  }
}

