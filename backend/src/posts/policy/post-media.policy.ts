// backend/src/posts/policy/post-media.policy.ts
import { ForbiddenException } from '@nestjs/common';

export class PostMediaPolicy {
  static assertOwnership(params: {
    actorUserId: string;
    ownerUserId: string;
  }) {
    if (params.actorUserId !== params.ownerUserId) {
      throw new ForbiddenException(
        'You do not own this media',
      );
    }
  }
}
