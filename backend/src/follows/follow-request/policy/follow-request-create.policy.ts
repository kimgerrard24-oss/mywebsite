// backend/src/follows/follow-request/policy/follow-request-create.policy.ts

import { ForbiddenException, ConflictException } from '@nestjs/common';

export class FollowRequestCreatePolicy {
  static assertCanCreate(params: {
    isSelf: boolean;
    isBlocked: boolean;
    alreadyFollowing: boolean;
    alreadyRequested: boolean;
  }) {
    if (params.isSelf) {
      throw new ForbiddenException('CANNOT_REQUEST_SELF');
    }

    if (params.isBlocked) {
      throw new ForbiddenException('USER_BLOCKED');
    }

    if (params.alreadyFollowing) {
      throw new ConflictException('ALREADY_FOLLOWING');
    }

    if (params.alreadyRequested) {
      throw new ConflictException('REQUEST_ALREADY_SENT');
    }
  }
}
