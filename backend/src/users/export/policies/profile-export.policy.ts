// backend/src/users/export/policies/profile-export.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class ProfileExportPolicy {
  static assertCanExport(params: {
    isDisabled: boolean;
    isBanned: boolean;
    isAccountLocked: boolean;
  }) {
    if (params.isAccountLocked) {
      throw new ForbiddenException(
        'Account is locked',
      );
    }

    // platform decision: allow banned users to export
    // if (params.isBanned) throw new ForbiddenException(...)

    if (params.isDisabled) {
      throw new ForbiddenException(
        'Account disabled',
      );
    }
  }
}
