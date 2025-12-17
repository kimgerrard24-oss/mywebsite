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
  try {
    const base =
      process.env.INTERNAL_BACKEND_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "https://api.phlyphant.com";

    const qs = new URLSearchParams();
    if (params.cursor) qs.set("cursor", params.cursor);
    if (params.limit) qs.set("limit", String(params.limit));

    const res = await fetch(`${base}/posts?${qs.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: params.cookie,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch feed");
    }

    return (await res.json()) as PostFeedResponse;
  } catch {
    return {
      items: [],
      nextCursor: null,
    };
  }
}
