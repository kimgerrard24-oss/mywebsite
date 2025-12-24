// backend/src/comments/policy/comment-update.policy.ts
import { ForbiddenException } from '@nestjs/common';

export class CommentUpdatePolicy {
  static assertCanUpdate(params: {
    viewerUserId: string;
    authorId: string;
  }) {
    const { viewerUserId, authorId } = params;

    if (viewerUserId !== authorId) {
      throw new ForbiddenException(
        'You are not allowed to edit this comment',
      );
    }
  }
}
