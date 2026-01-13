// backend/src/users/policies/update-username.policy.ts

import { BadRequestException, ForbiddenException } from '@nestjs/common';

const RESERVED = new Set([
  'admin',
  'support',
  'root',
  'system',
  'phlyphant',
]);

export class UpdateUsernamePolicy {
  static assertCanChange(params: {
    isDisabled: boolean;
    isBanned: boolean;
    isAccountLocked: boolean;
  }) {
    if (params.isBanned || params.isDisabled) {
      throw new ForbiddenException('Account not allowed to change username');
    }

    if (params.isAccountLocked) {
      throw new ForbiddenException('Account is locked');
    }
  }

  static assertValidUsername(username: string) {
    if (RESERVED.has(username.toLowerCase())) {
      throw new BadRequestException('Username is reserved');
    }
  }
}
