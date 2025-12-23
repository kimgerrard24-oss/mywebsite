// frontend/src/lib/api/comments.ts
import { api } from "./api";
import type { Comment } from "@/types/comment";

export async function createPostComment(
  postId: string,
  payload: { content: string }
): Promise<Comment> {
  const res = await api.post<Comment>(
    `/posts/${postId}/comments`,
    payload,
    {
      withCredentials: true

    }
  );

  return res.data;
}


export async function getPostComments(params: {
  postId: string;
  limit?: number;
  cursor?: string | null;
}): Promise<{
  items: Comment[];
  nextCursor: string | null;
}> {
  const { postId, limit = 20, cursor } = params;

  const res = await api.get<{
    items: Comment[];
    nextCursor: string | null;
  }>(`/posts/${postId}/comments`, {
    params: {
      limit,
      ...(cursor ? { cursor } : {}),
    },
    withCredentials: true,
  });

  return res.data;
}