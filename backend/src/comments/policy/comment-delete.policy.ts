// backend/src/comments/policy/comment-delete.policy.ts
import { ForbiddenException } from '@nestjs/common';

export class CommentDeletePolicy {
  static assertCanDelete(params: {
    viewerUserId: string;
    authorId: string;
  }) {
    const { viewerUserId, authorId } = params;

    if (viewerUserId !== authorId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }
  }
}
