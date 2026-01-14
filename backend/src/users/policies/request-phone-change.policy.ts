// backend/src/users/policies/request-phone-change.policy.ts

import { ForbiddenException } from '@nestjs/common';
import {
  parsePhoneNumberFromString,
  CountryCode,
} from 'libphonenumber-js';

export class RequestPhoneChangePolicy {

  static assertCanRequest(params: {
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

  static normalizePhone(
    raw: string,
    countryCode: string,
  ): string {
    const cc = countryCode.toUpperCase() as CountryCode;

    const parsed = parsePhoneNumberFromString(raw, cc);

    if (!parsed || !parsed.isValid()) {
      throw new ForbiddenException(
        'Invalid phone number',
      );
    }

    return parsed.number; // ✅ E.164: +668...
  }
}


