// frontend/src/lib/api/search-posts.ts

import { apiGet } from '@/lib/api/api';

/**
 * ==============================
 * Types
 * ==============================
 */

export type SearchPostItem = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isBlocked: boolean;
  };
};

export type SearchPostsResponse = {
  items: SearchPostItem[];
  nextCursor: string | null;
};

/**
 * ==============================
 * API
 * ==============================
 *
 * GET /search/posts?q=
 * - Cookie-based auth (HttpOnly)
 * - Backend is authority
 * - Fail via throw (caller decides soft/hard)
 */
export async function searchPosts(params: {
  q: string;
  limit?: number;
  cursor?: string | null;
}): Promise<SearchPostsResponse> {
  const { q, limit, cursor } = params;

  return apiGet<SearchPostsResponse>('/search/posts', {
    params: {
      q,
      limit,
      cursor: cursor ?? undefined,
    },
  });
}
