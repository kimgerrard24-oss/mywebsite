// backend/src/comments/policy/comment-read.policy.ts
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CommentReadPolicy {
  assertCanRead(post: { id: string }) {
    if (!post) {
      throw new ForbiddenException();
    }
  }
}
