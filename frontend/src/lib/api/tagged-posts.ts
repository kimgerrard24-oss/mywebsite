// frontend/src/lib/api/tagged-posts.ts

import { apiGet } from "./api";
import type {
  MyTaggedPostsResponse,
} from "@/types/tagged-posts";

/**
 * GET /users/me/tagged-posts
 * Backend authority
 */
export async function getMyTaggedPosts(
  params?: {
    limit?: number;
    cursor?: string;
  },
): Promise<MyTaggedPostsResponse> {
  const q = new URLSearchParams();

  if (params?.limit) {
    q.set("limit", String(params.limit));
  }

  if (params?.cursor) {
    q.set("cursor", params.cursor);
  }

  const qs = q.toString();

  return apiGet(
    `/users/me/tagged-posts${
      qs ? `?${qs}` : ""
    }`,
  );
}
