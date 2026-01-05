// frontend/src/lib/api/admin-comments.ts

import { apiDelete } from '@/lib/api/api';
import type { AdminCommentDetail } from "@/types/admin-comment";
import type {
  AdminDeleteCommentPayload,
  AdminDeleteCommentResult,
} from '@/types/admin-comment';
import { apiGet } from "@/lib/api/api";

export async function adminDeleteComment(
  params: AdminDeleteCommentPayload,
): Promise<AdminDeleteCommentResult> {
  const { commentId, reason } = params;

  return apiDelete(`/admin/comments/${commentId}`, {
    data: reason ? { reason } : undefined,
    withCredentials: true,
  });
}

export async function fetchAdminCommentById(
  commentId: string,
  params?: { cookieHeader?: string },
): Promise<AdminCommentDetail> {
  return apiGet(`/admin/comments/${commentId}`, {
    headers: params?.cookieHeader
      ? { Cookie: params.cookieHeader }
      : undefined,
  });
}  
