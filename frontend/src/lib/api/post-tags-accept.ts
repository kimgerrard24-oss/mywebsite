// frontend/src/lib/api/post-tags-accept.ts

import { api } from "@/lib/api/api";

export async function acceptPostTag(params: {
  postId: string;
  tagId: string;
}) {
  const { postId, tagId } = params;

  const res = await api.post(
    `/posts/${postId}/tags/${tagId}/accept`,
    null,
    { withCredentials: true },
  );

  return res.data as { success: true };
}
