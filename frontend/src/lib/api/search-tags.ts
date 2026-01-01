// frontend/src/lib/api/search-tags.ts

import { apiGet } from "@/lib/api/api";

export type SearchTagItem = {
  id: string;
  name: string;
  postCount: number;
};

export type SearchTagsResponse = {
  items: SearchTagItem[];
  nextCursor: string | null;
};

/**
 * GET /search/tags?q=
 * - Cookie-based auth (HttpOnly)
 * - Backend authority
 */
export async function searchTags(params: {
  q: string;
  limit?: number;
  cursor?: string | null;
}): Promise<SearchTagsResponse> {
  const { q, limit, cursor } = params;

  return apiGet<SearchTagsResponse>("/search/tags", {
    params: {
      q,
      limit,
      cursor: cursor ?? undefined,
    },
  });
}
