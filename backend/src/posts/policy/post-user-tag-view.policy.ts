// backend/src/posts/policy/post-user-tag-view.policy.ts

import { PostUserTagStatus } from '@prisma/client';

export class PostUserTagViewPolicy {
  /**
   * Decide whether a tag record should be visible to viewer
   *
   * Authority rules:
   * - ACCEPTED: visible to everyone
   * - PENDING: visible only to post owner and tagged user
   * - REJECTED / REMOVED: visible to no one (treated as non-existent)
   */
  static canView(params: {
    status: PostUserTagStatus;
    isPostOwner: boolean;
    isTaggedUser: boolean;
  }): boolean {
    const { status, isPostOwner, isTaggedUser } = params;

    switch (status) {
      case 'ACCEPTED':
        return true;

      case 'PENDING':
        return isPostOwner || isTaggedUser;

      case 'REJECTED':
      case 'REMOVED':
        return false;

      default: {
        // defensive: unknown state must never be visible
        return false;
      }
    }
  }
}
