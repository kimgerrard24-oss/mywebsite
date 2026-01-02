// backend/src/admin/posts/admin-posts.service.ts

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminPostsRepository } from './admin-posts.repository';
import { AdminAuditService } from '../audit/admin-audit.service';

@Injectable()
export class AdminPostsService {
  constructor(
    private readonly repo: AdminPostsRepository,
    private readonly audit: AdminAuditService,
  ) {}

  async deletePost(params: {
    postId: string;
    reason: string;
  }) {
    const { postId, reason } = params;

    const post = await this.repo.findById(postId);

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    if (post.isDeleted) {
      // idempotent
      return;
    }

    await this.repo.softDelete({
      postId,
      reason,
    });

    await this.audit.log({
      action: 'DELETE_POST',
      targetId: postId,
      detail: {
        reason,
        authorId: post.authorId,
      },
    });
  }
}
