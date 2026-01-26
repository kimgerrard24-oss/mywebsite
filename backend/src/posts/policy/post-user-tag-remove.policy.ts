// backend/src/posts/policy/post-user-tag-remove.policy.ts

import { PostUserTagStatus } from '@prisma/client';

export class PostUserTagRemovePolicy {
  static decide(params: {
    actorUserId: string;
    taggedUserId: string;
    taggedByUserId: string;
    postAuthorId: string;
    currentStatus: PostUserTagStatus;
    isBlockedEitherWay: boolean;
  }): { allowed: boolean } {
    const {
      actorUserId,
      taggedUserId,
      currentStatus,
      isBlockedEitherWay,
    } = params;

    // absolute deny
    if (isBlockedEitherWay) return { allowed: false };

    // only tagged user can self-remove
    if (actorUserId !== taggedUserId)
      return { allowed: false };

    if (
      currentStatus !== 'PENDING' &&
      currentStatus !== 'ACCEPTED'
    ) {
      return { allowed: false };
    }

    return { allowed: true };
  }
}
