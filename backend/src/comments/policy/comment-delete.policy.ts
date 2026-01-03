import { ForbiddenException } from '@nestjs/common';

type CommentDeletePolicyParams = {
  viewerUserId: string;
  authorId: string;

  /**
   * 🔑 Optional
   * - ไม่ส่งมา = behavior เดิม
   */
  viewerRole?: 'ADMIN' | 'USER';
};

export class CommentDeletePolicy {
  static assertCanDelete(params: CommentDeletePolicyParams) {
    const {
      viewerUserId,
      authorId,
      viewerRole,
    } = params;

    /**
     * ✅ ADMIN override
     * - admin ลบได้ทุก comment
     */
    if (viewerRole === 'ADMIN') {
      return;
    }

    /**
     * 🔒 Default behavior (เดิม)
     * - author เท่านั้น
     */
    if (viewerUserId !== authorId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }
  }
}
