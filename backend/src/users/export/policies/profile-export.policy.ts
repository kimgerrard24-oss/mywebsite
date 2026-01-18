// backend/src/users/export/policies/profile-export.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class ProfileExportPolicy {
  static assertCanExport(params: {
    isDisabled: boolean;
    isBanned: boolean;
    isAccountLocked: boolean;
  }) {
    /**
     * Disabled account
     * - system-level restriction
     */
    if (params.isDisabled) {
      throw new ForbiddenException(
        'Account is disabled',
      );
    }

    /**
     * Locked account
     * - user-triggered security state
     */
    if (params.isAccountLocked) {
      throw new ForbiddenException(
        'Account is locked',
      );
    }

    /**
     * Banned account
     * - platform policy: still allowed to export data
     *   for compliance reasons (GDPR / PDPA)
     */
    // if (params.isBanned) {
    //   throw new ForbiddenException('Account is banned');
    // }
  }
}
