// backend/src/admin/posts/policy/admin-post.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class AdminPostPolicy {
  /**
   * Business-level policy for admin post visibility
   * - Auth & role handled by guards
   * - This is for future-proof moderation rules
   */
  static assertReadable(post: {
    isDeleted?: boolean | null;
    deletedSource?: string | null;
    isHidden?: boolean | null;
  }) {
    // Example future rule:
    // if (post.deletedSource === 'SYSTEM') {
    //   throw new ForbiddenException(
    //     'System-deleted post is restricted',
    //   );
    // }

    // Currently: all ADMIN can read
    return true;
  }
}
