// backend/src/admin/posts/admin-posts.service.ts

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminPostsRepository } from './admin-posts.repository';
import { AdminAuditService } from '../audit/admin-audit.service';
import { AdminPostDetailDto } from './dto/admin-post-detail.dto';
import { AdminPostPolicy } from './policy/admin-post.policy';

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

  async getPostById(
    postId: string,
  ): Promise<AdminPostDetailDto> {
    const post =
      await this.repo.findPostById(postId);

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    AdminPostPolicy.assertReadable(post);

    return AdminPostDetailDto.from(post);
  }
}
