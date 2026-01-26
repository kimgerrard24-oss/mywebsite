// backend/src/posts/policy/post-user-tag-reject.policy.ts

import { PostUserTagStatus } from '@prisma/client';

export class PostUserTagRejectPolicy {
  static decide(params: {
    actorUserId: string;
    taggedUserId: string;
    postAuthorId: string;
    currentStatus: PostUserTagStatus;
    isBlockedEitherWay: boolean;
  }): { allowed: boolean; reason?: string } {
    const {
      actorUserId,
      taggedUserId,
      postAuthorId,
      currentStatus,
      isBlockedEitherWay,
    } = params;

    if (isBlockedEitherWay) {
      return { allowed: false, reason: 'blocked' };
    }

    // only tagged user can reject
    if (actorUserId !== taggedUserId) {
      return { allowed: false, reason: 'not_tagged_user' };
    }

    if (currentStatus !== 'PENDING') {
      return { allowed: false, reason: 'invalid_status' };
    }

    return { allowed: true };
  }
}
