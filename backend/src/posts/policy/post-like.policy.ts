// src/posts/policy/post-like.policy.ts
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class PostLikePolicy {
  assertCanLike(post: {
    id: string;
    isDeleted: boolean;
    isHidden: boolean;
  } | null): void {
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.isDeleted || post.isHidden) {
      throw new ForbiddenException('Post is not available');
    }
  }
}
