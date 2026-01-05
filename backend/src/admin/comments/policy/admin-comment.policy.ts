// backend/src/admin/comments/policy/admin-comment.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class AdminCommentPolicy {
  /**
   * Business-level policy for admin comment visibility
   * - Auth & role handled by guards
   * - This layer is for future moderation rules
   */
  static assertReadable(comment: {
    isDeleted?: boolean | null;
    deletedSource?: string | null;
    isHidden?: boolean | null;
  }) {
    // 🔒 Example future rule (disabled for now)
    // if (comment.deletedSource === 'SYSTEM') {
    //   throw new ForbiddenException(
    //     'System-deleted comment is restricted',
    //   );
    // }

    // Currently: all ADMIN can read
    return true;
  }
}
