// frontend/src/lib/api/post-tags-me.ts

import { api } from "@/lib/api/api";

export async function removeMyPostTag(params: {
  postId: string;
}) {
  const { postId } = params;

  const res = await api.delete(
    `/posts/${postId}/tags/me`,
    { withCredentials: true },
  );

  return res.data as {
    success: true;
  };
}
