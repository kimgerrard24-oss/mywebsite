// frontend/src/lib/api/admin-posts.ts

import { apiGet } from "@/lib/api/api";
import type { AdminPostDetail } from "@/types/admin-post";

export async function fetchAdminPostById(
  postId: string,
  params?: { cookieHeader?: string },
): Promise<AdminPostDetail> {
  return apiGet(`/admin/posts/${postId}`, {
    headers: params?.cookieHeader
      ? { Cookie: params.cookieHeader }
      : undefined,
  });
}
