// backend/src/comments/replies/policy/comment-reply.policy.ts

import { BadRequestException } from '@nestjs/common';

export class CommentReplyPolicy {
  /**
   * 🔒 Only 1-level nested comment allowed
   */
  static assertCanReply(parent: {
    parentId: string | null;
  }) {
    if (parent.parentId !== null) {
      throw new BadRequestException(
        'Nested replies deeper than 1 level are not allowed',
      );
    }
  }
}
