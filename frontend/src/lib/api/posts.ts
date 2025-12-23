// frontend/src/lib/api/posts.ts
import { api, apiPath } from './api';
import type { GetServerSidePropsContext } from "next";
import type { CreatePostPayload } from '@/types/post';
import type { PostFeedResponse } from '@/types/post-feed';
import type { PostDetail } from "@/types/post-detail";
import { UserPostFeedResponse, PostFeedItem } from '@/types/post-feed';
import { IncomingMessage } from 'http';

type GetVideoFeedParams = {
  limit?: number;
  cursor?: string | null;
};

type GetVideoFeedResponse = {
  items: PostFeedItem[];
  nextCursor: string | null;
};


const API_BASE =
  process.env.INTERNAL_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL!;

  
export async function getPostsByTag(
  tag: string,
  options?: {
    req?: IncomingMessage;
    cursor?: string;
  },
): Promise<PostFeedResponse> {
  const url = new URL(
    `/posts/tag/${encodeURIComponent(tag)}`,
    API_BASE,
  );

  if (options?.cursor) {
    url.searchParams.set('cursor', options.cursor);
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      ...(options?.req?.headers.cookie
        ? { cookie: options.req.headers.cookie }
        : {}),
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts by tag');
  }

  return res.json();
}

export async function likePost(postId: string): Promise<{
  liked: boolean;
  likeCount: number;
}> {
  const res = await api.post(`/posts/${postId}/like`);
  return res.data;
}

export async function getVideoFeed(params?: {
  limit?: number;
  cursor?: string;
}) {
  const search = new URLSearchParams();

  search.set("mediaType", "video");

  if (params?.limit) {
    search.set("limit", String(params.limit));
  }

  if (params?.cursor) {
    search.set("cursor", params.cursor);
  }

  const res = await api.get(`/posts?${search.toString()}`);

  return res.data as {
    items: PostFeedItem[];
    nextCursor: string | null;
  };
}


export async function getUserPosts(params: {
  userId: string;
  cursor?: string | null;
  limit?: number;
  cookie?: string; // มีเฉพาะ SSR
}): Promise<UserPostFeedResponse> {
  const { userId, cursor, limit, cookie } = params;

  const qs = new URLSearchParams();
  if (cursor) qs.set("cursor", cursor);
  if (limit) qs.set("limit", String(limit));

  const isServer = typeof window === "undefined";

  const base = isServer
    ? process.env.INTERNAL_BACKEND_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      "https://api.phlyphant.com"
    : process.env.NEXT_PUBLIC_BACKEND_URL ??
      "https://api.phlyphant.com";

  const res = await fetch(
    `${base.replace(/\/+$/, "")}/posts/user/${userId}?${qs.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      credentials: isServer ? "same-origin" : "include",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to load user posts");
  }

  return res.json();
 }

 export async function createPost(
  payload: CreatePostPayload,
 ): Promise<CreatePostResponse> {
  const res = await api.post<CreatePostResponse>(
    "/posts",
    payload,
    {
      withCredentials: true, // cookie-based auth (production)
    },
  );

  return res.data as {
    id: string;
    createdAt: string;
  };
 }

 export type CreatePostResponse = {
  id: string;
  createdAt: string;
 };

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

 export async function getPostById(
  postId: string,
  ctx?: GetServerSidePropsContext,
 ): Promise<PostDetail | null> {
  try {
    const res = await api.get<PostDetail>(
      `/posts/${postId}`,
      ctx
        ? {
            headers: {
              cookie: ctx.req.headers.cookie || "",
            },
            withCredentials: true,
          }
        : {
            withCredentials: true,
          },
    );

    return res.data;
  } catch {
    return null;
  }
  
 }


 export async function updatePost(params: {
  postId: string;
  content: string;
 }) {
  const { postId, content } = params;

  const res = await api.put(
    `/posts/${postId}`,
    { content },
    { withCredentials: true },
  );

  return res.data as {
    id: string;
    content: string;
    editedAt: string;
  };
 
}
