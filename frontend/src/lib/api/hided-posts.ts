// frontend/src/lib/api/hided-posts.ts

import { api } from "./api";
import type { PostFeedResponse } from "@/types/post-feed";

export async function getMyHiddenTaggedPosts(
  cookie?: string,
  cursor?: string,
  limit = 20,
): Promise<PostFeedResponse> {
  const qs = new URLSearchParams();
  if (cursor) qs.set("cursor", cursor);
  qs.set("limit", String(limit));

  const res = await fetch(
    `${process.env.INTERNAL_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL}/posts/me/tagged-posts/hidden?${qs}`,
    {
      headers: {
        Accept: "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to load hidden tagged posts");
  }

  return res.json();
}

export async function unhideTaggedPost(postId: string) {
  const res = await api.post(
    `/posts/${postId}/tags/unhide`,
    {},
    { withCredentials: true },
  );

  return res.data as { success: true };
}
