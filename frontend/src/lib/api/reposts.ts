// frontend/src/lib/api/reposts.ts

import { api } from './api';
import type { 
  CreateRepostResponse,
  GetPostRepostsResponse,
 } from '@/types/repost';

/**
 * Create repost
 * POST /reposts
 *
 * Backend is the only authority.
 * Frontend does NOT check visibility or ownership.
 */
export async function createRepost(
  postId: string,
): Promise<CreateRepostResponse> {
  const res = await api.post<CreateRepostResponse>(
    '/reposts',
    { postId },
    {
      withCredentials: true,
    },
  );

  return res.data;
}

/**
 * Undo repost
 * DELETE /reposts/:postId
 *
 * Backend is authoritative.
 * Idempotent: deleting a non-existing repost is OK.
 */
export async function deleteRepost(
  postId: string,
): Promise<void> {
  await api.delete(
    `/reposts/${postId}`,
    {
      withCredentials: true,
    },
  );
}

/**
 * Get reposts of a post
 * GET /posts/:id/reposts
 *
 * Backend is the only authority.
 * Frontend does NOT check visibility, ownership, or blocks.
 */
export async function getPostReposts(
  postId: string,
  params?: {
    cursor?: string;
    limit?: number;
  },
): Promise<GetPostRepostsResponse> {
  const res = await api.get<GetPostRepostsResponse>(
    `/posts/${postId}/reposts`,
    {
      params,
      withCredentials: true,
    },
  );

  return res.data;
}