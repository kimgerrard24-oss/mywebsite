// frontend/src/lib/api/post-tags-reject.ts

import { api } from "@/lib/api/api";

export async function rejectPostTag(params: {
  postId: string;
  tagId: string;
}) {
  const { postId, tagId } = params;

  const res = await api.post(
    `/posts/${postId}/tags/${tagId}/reject`,
    null,
    { withCredentials: true },
  );

  return res.data as { success: true };
}
