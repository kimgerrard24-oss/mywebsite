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
    // 🔍 audit: target not found
    try {
      await this.audit.log({
        action: 'ADMIN_DELETE_POST_TARGET_NOT_FOUND',
        targetId: postId,
      });
    } catch {}

    throw new NotFoundException('Post not found');
  }

  if (post.isDeleted) {
    // ♻️ audit: idempotent delete
    try {
      await this.audit.log({
        action: 'ADMIN_DELETE_POST_NOOP_ALREADY_DELETED',
        targetId: postId,
        detail: {
          authorId: post.authorId,
        },
      });
    } catch {}

    return;
  }

  await this.repo.softDelete({
    postId,
    reason,
  });

  // ✅ audit: delete success
  try {
    await this.audit.log({
      action: 'ADMIN_DELETE_POST',
      targetId: postId,
      detail: {
        reason,
        authorId: post.authorId,
      },
    });
  } catch {}
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
