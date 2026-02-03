// frontend/src/lib/api/reposts.ts

import { api } from './api';

type RepostPostResponse = {
  repostCount: number;
};

export async function repostPost(
  postId: string,
  content?: string,
): Promise<RepostPostResponse> {
  const res = await api.post<RepostPostResponse>(
    `/posts/${postId}/repost`,
    { content },
  );

  return res.data;
}



type UndoRepostResponse = {
  repostCount: number;
};

export async function undoRepost(
  postId: string,
): Promise<UndoRepostResponse> {
  const res = await api.delete<UndoRepostResponse>(
    `/posts/${postId}/repost`,
  );

  return res.data;
}

