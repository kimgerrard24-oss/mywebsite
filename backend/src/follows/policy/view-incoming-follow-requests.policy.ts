// backend/src/follows/follow-request/policy/view-incoming-follow-requests.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class ViewIncomingFollowRequestsPolicy {
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
