// frontend/src/lib/api/comments.ts
import { api } from "./api";
import type { 
  Comment, 
  CreateCommentPayload,
  CreateReplyPayload, } from "@/types/comment";  

export async function createPostComment(
  postId: string,
  payload: CreateCommentPayload,
): Promise<Comment> {
  const res = await api.post<Comment>(
    `/posts/${postId}/comments`,
    payload,
    {
      withCredentials: true,
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

export async function updateComment(
  commentId: string,
  content: string,
): Promise<{
  id: string;
  content: string;
  isEdited: boolean;
  editedAt: string;
}> {
  const res = await api.put(
    `/comments/${commentId}`,
    { content },
    {
      withCredentials: true,
    },
  );

  return res.data;
}


export async function deleteComment(
  commentId: string,
): Promise<{ success: true }> {
  const res = await api.delete(
    `/comments/${commentId}`,
    {
      withCredentials: true,
    },
  );

  return res.data;
}

export async function toggleCommentLike(
  commentId: string,
): Promise<{
  liked: boolean;
  likeCount: number;
}> {
  const res = await api.post(
    `/comments/${commentId}/like`,
    null,
    {
      withCredentials: true,
    },
  );

  return res.data;
}

// 🔹 create reply (with mention support)
export async function createCommentReply(
  commentId: string,
  payload: CreateReplyPayload,
): Promise<Comment> {

  const res = await api.post<Comment>(
    `/comments/${commentId}/replies`,
    payload,
    {
      withCredentials: true,
    },
  );

  return res.data;
}
