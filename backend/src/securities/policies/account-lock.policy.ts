// backend/src/securities/policies/account-lock.policy.ts

import { BadRequestException, ForbiddenException } from '@nestjs/common';

export class AccountLockPolicy {
  static assertCanLock(params: {
    isAccountLocked: boolean;
    isDisabled: boolean;
    isBanned: boolean;
  }) {
    if (params.isAccountLocked) {
      throw new BadRequestException('Account already locked');
    }

    if (params.isDisabled) {
      throw new ForbiddenException('Account is disabled');
    }

    // admin ban should not be overridden by self-lock
    if (params.isBanned) {
      throw new ForbiddenException('Account is banned by moderation');
    }
  }
}
