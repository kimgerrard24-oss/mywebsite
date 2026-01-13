// backend/src/users/policies/confirm-email-change.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class ConfirmEmailChangePolicy {
  static assertCanConfirm(params: {
    isDisabled: boolean;
    isBanned: boolean;
    isAccountLocked: boolean;
  }) {
    if (params.isDisabled) {
      throw new ForbiddenException('Account disabled');
    }

    if (params.isBanned) {
      throw new ForbiddenException('Account banned');
    }

    if (params.isAccountLocked) {
      throw new ForbiddenException('Account locked');
    }
  }
}
