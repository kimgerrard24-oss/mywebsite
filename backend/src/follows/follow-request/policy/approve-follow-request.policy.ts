// backend/src/follows/follow-request/policy/approve-follow-request.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class ApproveFollowRequestPolicy {
  static assertAllowed(params: {
    isDisabled: boolean;
    isBanned: boolean;
    isAccountLocked: boolean;
  }) {
    if (params.isDisabled) {
      throw new ForbiddenException(
        'Account is disabled',
      );
    }
    if (params.isBanned) {
      throw new ForbiddenException(
        'Account is banned',
      );
    }
    if (params.isAccountLocked) {
      throw new ForbiddenException(
        'Account is locked',
      );
    }
  }
}
