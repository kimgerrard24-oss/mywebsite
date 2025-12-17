// frontend/src/lib/api/posts.ts
import { api } from './api';
import type { CreatePostPayload } from '@/types/post';
import type { PostFeedResponse } from '@/types/post-feed';

const API_BASE =
  process.env.INTERNAL_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function createPost(
  payload: CreatePostPayload,
) {
  const res = await api.post('/posts', payload, {
    withCredentials: true,
  });

  return res.data as {
    id: string;
    createdAt: string;
  };
}

export async function getPublicFeed(params: {
  cookie: string;
  cursor?: string;
  limit?: number;
}): Promise<PostFeedResponse> {
  const res = await api.get<PostFeedResponse>(
    '/posts',
    {
      params: {
        cursor: params.cursor,
        limit: params.limit,
      },
      headers: {
        cookie: params.cookie,
      },
      withCredentials: true,
    },
  );

  return res.data;
}
