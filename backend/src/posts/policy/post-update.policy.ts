// backend/src/posts/policy/post-update.policy.ts
import { ForbiddenException } from '@nestjs/common';

export class PostUpdatePolicy {
  static assertCanUpdate(params: {
    actorUserId: string;
    ownerUserId: string;
  }) {
    const { actorUserId, ownerUserId } = params;

    if (actorUserId !== ownerUserId) {
      throw new ForbiddenException(
        'You are not allowed to update this post',
      );
    }
  }
}

