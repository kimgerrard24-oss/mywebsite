// backend/src/admin/users/policy/admin-user.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class AdminUserPolicy {
  /**
   * Business-level policy for admin user visibility
   * - Auth & role already handled by guards
   * - This layer is for future compliance rules
   */
  static assertReadable(user: {
    role?: string;
    isDisabled?: boolean;
  }) {
    // 🔒 Example future rule:
    // if (user.role === 'SUPER_ADMIN') {
    //   throw new ForbiddenException(
    //     'Super admin profile is restricted',
    //   );
    // }

    // Currently: all ADMIN can read
    return true;
  }
}
