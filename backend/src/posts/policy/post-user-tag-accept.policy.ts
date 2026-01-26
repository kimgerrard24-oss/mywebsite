// backend/src/posts/policy/post-user-tag-accept.policy.ts

import { PostUserTagStatus } from '@prisma/client';

export class PostUserTagAcceptPolicy {
  static decide(params: {
    actorUserId: string;
    taggedUserId: string;
    currentStatus: PostUserTagStatus;
    isBlockedEitherWay: boolean;
  }): {
    allowed: boolean;
    reason?: string;
  } {
    const {
      actorUserId,
      taggedUserId,
      currentStatus,
      isBlockedEitherWay,
    } = params;

    if (actorUserId !== taggedUserId) {
      return { allowed: false, reason: 'NOT_TAGGED_USER' };
    }

    if (isBlockedEitherWay) {
      return { allowed: false, reason: 'BLOCKED' };
    }

    if (currentStatus !== 'PENDING') {
      return { allowed: false, reason: 'INVALID_STATUS' };
    }

    return { allowed: true };
  }
}
