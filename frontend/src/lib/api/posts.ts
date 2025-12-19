// frontend/src/lib/api/posts.ts
import { api } from './api';
import type { GetServerSidePropsContext } from "next";
import type { CreatePostPayload } from '@/types/post';
import type { PostFeedResponse } from '@/types/post-feed';
import type { PostDetail } from "@/types/post-detail";

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
