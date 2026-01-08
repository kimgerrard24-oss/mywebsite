// backend/src/admin/comments/admin-comments.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AdminCommentsRepository } from './admin-comments.repository';
import { AdminAuditService } from '../audit/admin-audit.service';
import { RequestContextService } from '../../common/middleware/request-context.service';
import { AdminCommentDetailDto } from './dto/admin-comment-detail.dto';
import { AdminCommentPolicy } from './policy/admin-comment.policy';

@Injectable()
export class AdminCommentsService {
  constructor(
    private readonly repo: AdminCommentsRepository,
    private readonly audit: AdminAuditService,
    private readonly ctx: RequestContextService,
  ) {}

  async deleteComment(params: {
  commentId: string;
  reason?: string;
}) {
  const { commentId, reason } = params;

  const admin = this.ctx.getUser();
  if (!admin) {
    // 🔍 audit: admin context missing
    try {
      await this.audit.log({
        action: 'ADMIN_DELETE_COMMENT_CONTEXT_MISSING',
        targetId: commentId,
      });
    } catch {}

    throw new BadRequestException(
      'Admin context missing',
    );
  }

  const comment = await this.repo.findById(commentId);

  if (!comment) {
    // 🔍 audit: target not found
    try {
      await this.audit.log({
        action: 'ADMIN_DELETE_COMMENT_TARGET_NOT_FOUND',
        targetId: commentId,
      });
    } catch {}

    throw new NotFoundException(
      'Comment not found',
    );
  }

  if (comment.isDeleted) {
  try {
    await this.audit.log({
      action: 'ADMIN_DELETE_COMMENT_NOOP_ALREADY_DELETED',
      targetId: commentId,
      detail: {
        authorId: comment.authorId,
      },
    });
  } catch {}

  throw new BadRequestException(
    'Comment already deleted',
  );
}


  await this.repo.softDelete({
    commentId,
    reason,
    adminId: admin.userId,
  });

  // ✅ audit: delete success
  try {
  await this.audit.log({
    action: 'ADMIN_DELETE_COMMENT',
    targetId: commentId,
    detail: {
      reason,
      authorId: comment.authorId,
    },
  });
} catch {}


  return { success: true };
}


   async getCommentById(
    commentId: string,
  ): Promise<AdminCommentDetailDto> {
    const comment =
      await this.repo.findCommentById(commentId);

    if (!comment) {
      throw new NotFoundException(
        'Comment not found',
      );
    }

    AdminCommentPolicy.assertReadable(comment);

    return AdminCommentDetailDto.from(comment);
  }
}
