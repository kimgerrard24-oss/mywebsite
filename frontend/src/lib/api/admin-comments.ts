// frontend/src/lib/api/admin-comments.ts

import { apiDelete } from '@/lib/api/api';

import type {
  AdminDeleteCommentPayload,
  AdminDeleteCommentResult,
} from '@/types/admin-comment';

export async function adminDeleteComment(
  params: AdminDeleteCommentPayload,
): Promise<AdminDeleteCommentResult> {
  const { commentId, reason } = params;

  return apiDelete(`/admin/comments/${commentId}`, {
    data: reason ? { reason } : undefined,
    withCredentials: true,
  });
}

