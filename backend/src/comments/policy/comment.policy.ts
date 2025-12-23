// backend/src/comments/policy/comment.policy.ts
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CommentsPolicy {
  assertCanComment(post: { id: string }) {
    if (!post) {
      throw new ForbiddenException();
    }
  }
}
