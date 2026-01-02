// frontend/src/lib/api/admin-comments.ts

import { apiDelete } from '@/lib/api/api';

export async function adminDeleteComment(params: {
  commentId: string;
  reason?: string;
}): Promise<{ success: true }> {
  const { commentId, reason } = params;

  return apiDelete(`/admin/comments/${commentId}`, {
    data: reason ? { reason } : undefined,
  });
}
