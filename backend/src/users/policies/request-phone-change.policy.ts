// backend/src/users/policies/request-phone-change.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class RequestPhoneChangePolicy {
  static assertCanRequest(params: {
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

  static normalizePhone(
    raw: string,
    countryCode: string,
  ): string {
    // assume already numeric
    // real system could use libphonenumber
    return raw.trim();
  }
}

