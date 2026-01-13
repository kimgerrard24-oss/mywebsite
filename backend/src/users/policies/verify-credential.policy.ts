// backend/src/users/policies/verify-credential.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class VerifyCredentialPolicy {
  static assertCanVerify(params: {
    isDisabled: boolean;
    isBanned: boolean;
    isAccountLocked: boolean;
  }) {
    if (params.isBanned) {
      throw new ForbiddenException('Account is banned');
    }

    if (params.isDisabled) {
      throw new ForbiddenException('Account is disabled');
    }

    if (params.isAccountLocked) {
      throw new ForbiddenException('Account is locked');
    }
  }
}
