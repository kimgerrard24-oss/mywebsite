// frontend/src/lib/api/admin-delete-post.ts

import { apiDelete } from "@/lib/api/api";
import type {
  AdminDeletePostPayload,
  AdminDeletePostResponse,
} from "@/types/admin-delete-post";

/**
 * ==============================
 * DELETE /admin/posts/:id
 * ==============================
 *
 * Client-side only
 * Backend is authority
 */
export async function adminDeletePost(
  postId: string,
  payload: AdminDeletePostPayload,
): Promise<AdminDeletePostResponse> {
  return apiDelete<AdminDeletePostResponse>(
    `/admin/posts/${postId}`,
    {
      data: payload,
      withCredentials: true,
    },
  );
}
