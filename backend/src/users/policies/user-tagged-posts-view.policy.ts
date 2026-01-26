// backend/src/users/policies/user-tagged-posts-view.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class UserTaggedPostsViewPolicy {
  static assertCanView(params: {
    isDisabled: boolean;
    isBanned: boolean;
  }) {
    if (params.isDisabled || params.isBanned) {
      throw new ForbiddenException(
        'Account not allowed to view tagged posts',
      );
    }
  }

  static normalizeLimit(input?: number) {
    const v = input ?? 20;
    return Math.min(Math.max(v, 1), 50);
  }
}
