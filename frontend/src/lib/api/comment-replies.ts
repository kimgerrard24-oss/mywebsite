// frontend/src/lib/api/comment-replies.ts

import { api } from "@/lib/api/api";
import type { Comment } from "@/types/comment";

export async function getCommentReplies(params: {
  parentCommentId: string;
  limit?: number;
  cursor?: string;
}) {
  const res = await api.get<{
    items: Comment[];
    nextCursor: string | null;
  }>(`/comments/${params.parentCommentId}/replies`, {
    params: {
      limit: params.limit ?? 10,
      cursor: params.cursor,
    },
    withCredentials: true,
  });

  return res.data;
}

export async function createCommentReply(
  parentCommentId: string,
  payload: { content: string },
): Promise<Comment> {
  const res = await api.post<Comment>(
    `/comments/${parentCommentId}/replies`,
    payload,
    { withCredentials: true },
  );

  return res.data;
}
