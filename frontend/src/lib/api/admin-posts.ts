// frontend/src/lib/api/admin-posts.ts

import { apiGet } from "@/lib/api/api";
import type { AdminPostDetail } from "@/types/admin-post";

/**
 * ==============================
 * GET /admin/posts/:id
 * ==============================
 *
 * - Used in SSR only
 * - Backend is the sole authority
 * - Auth via HttpOnly cookie
 */
export async function fetchAdminPostById(
  postId: string,
  params?: { cookieHeader?: string },
): Promise<AdminPostDetail> {
  return apiGet<AdminPostDetail>(
    `/admin/posts/${postId}`,
    {
      headers: params?.cookieHeader
        ? { Cookie: params.cookieHeader }
        : undefined,
      withCredentials: true,
    },
  );
}
