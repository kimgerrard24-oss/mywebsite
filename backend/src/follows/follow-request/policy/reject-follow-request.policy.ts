// backend/src/follows/follow-request/policy/reject-follow-request.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class RejectFollowRequestPolicy {
  static assertAllowed(params: {
    isAccountLocked: boolean;
    isBanned: boolean;
    isDisabled: boolean;
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
