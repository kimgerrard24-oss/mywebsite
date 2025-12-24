// backend/src/follows/policy/follow-delete.policy.ts

import { ConflictException } from '@nestjs/common';

export class FollowDeletePolicy {
  static assertCanUnfollow(params: {
    followerId: string;
    followingId: string;
  }) {
    const { followerId, followingId } = params;

    if (followerId === followingId) {
      throw new ConflictException('CANNOT_UNFOLLOW_SELF');
    }
  }
}
