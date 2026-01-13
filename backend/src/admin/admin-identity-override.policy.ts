// backend/src/admin/admin-identity-override.policy.ts

import { BadRequestException } from '@nestjs/common';

export class AdminIdentityOverridePolicy {
  static assertPayloadValid(payload: {
    username?: string;
    email?: string;
    phoneNumber?: string;
  }) {
    if (
      !payload.username &&
      !payload.email &&
      !payload.phoneNumber
    ) {
      throw new BadRequestException(
        'No identity fields provided',
      );
    }
  }
}

