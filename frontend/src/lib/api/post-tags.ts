// frontend/src/lib/api/post-tags.ts

import { api } from "@/lib/api/api";
import type { PostUserTagItem } from "@/types/post-user-tag";

export type UpdatePostTagAction = "ACCEPT" | "REJECT" | "REMOVE";

export async function updatePostTag(params: {
  postId: string;
  tagId: string;
  action: UpdatePostTagAction;
}) {
  const { postId, tagId, action } = params;

  const res = await api.patch(
    `/posts/${postId}/tags`,
    { tagId, action },
    { withCredentials: true },
  );

  return res.data as {
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "REMOVED";
  };
}


export async function getPostTags(params: {
  postId: string;
  req?: any; // for SSR
}) {
  const { postId, req } = params;

  const res = await api.get(`/posts/${postId}/tags`, {
    withCredentials: true,
    headers: req?.headers?.cookie
      ? { cookie: req.headers.cookie }
      : undefined,
  });

  return res.data as PostUserTagItem[];
}