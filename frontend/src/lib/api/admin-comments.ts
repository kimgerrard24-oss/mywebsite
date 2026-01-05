// frontend/src/lib/api/admin-comments.ts

import { apiDelete, apiPath } from '@/lib/api/api';
import type {
  AdminCommentDetail,
  AdminDeleteCommentPayload,
  AdminDeleteCommentResult,
} from '@/types/admin-comment';

/**
 * ==============================
 * DELETE /admin/comments/:id
 * ==============================
 *
 * CSR only
 * Backend is authority
 */
export async function adminDeleteComment(
  params: AdminDeleteCommentPayload,
): Promise<AdminDeleteCommentResult> {
  const { commentId, reason } = params;

  return apiDelete(`/admin/comments/${commentId}`, {
    data: reason ? { reason } : undefined,
    withCredentials: true,
  });
}

type SSRContext = {
  cookieHeader?: string;
};

/**
 * ==============================
 * GET /admin/comments/:id
 * ==============================
 *
 * - SSR: fetch + Cookie
 * - CSR: fetch (include credentials)
 */
export async function fetchAdminCommentById(
  commentId: string,
  ctx?: SSRContext,
): Promise<AdminCommentDetail> {
  // 🔒 SSR path
  if (ctx?.cookieHeader) {
    const res = await fetch(
      apiPath(`/admin/comments/${commentId}`),
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Cookie: ctx.cookieHeader,
        },
        credentials: 'include',
        cache: 'no-store',
      },
    );

    if (!res.ok) {
      const err: any = new Error(
        `HTTP ${res.status}`,
      );
      err.status = res.status;
      throw err;
    }

    return res.json();
  }

  // ✅ CSR path
  const res = await fetch(
    apiPath(`/admin/comments/${commentId}`),
    {
      credentials: 'include',
    },
  );

  if (!res.ok) {
    const err: any = new Error(
      `HTTP ${res.status}`,
    );
    err.status = res.status;
    throw err;
  }

  return res.json();
}
