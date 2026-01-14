// backend/src/users/policies/confirm-phone-change.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class ConfirmPhoneChangePolicy {
  static assertCanConfirm(params: {
    isDisabled: boolean;
    isBanned: boolean;
    isAccountLocked: boolean;
  }): void {
    if (params.isDisabled) {
      throw new ForbiddenException('Account is disabled');
    }

    if (params.isBanned) {
      throw new ForbiddenException('Account is banned');
    }

    if (params.isAccountLocked) {
      throw new ForbiddenException('Account is locked');
    }
  }
}
