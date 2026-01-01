// frontend/src/lib/api/search-users.ts

import { apiGet } from '@/lib/api/api';

export type SearchUserItem = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type SearchUsersResponse = {
  items: SearchUserItem[];
  nextCursor: string | null;
};

/**
 * GET /search/users?q=
 * - Cookie-based auth (HttpOnly)
 * - Backend authority
 */
export async function searchUsers(params: {
  q: string;
  limit?: number;
  cursor?: string | null;
}): Promise<SearchUsersResponse> {
  const { q, limit, cursor } = params;

  return apiGet<SearchUsersResponse>('/search/users', {
    params: {
      q,
      limit,
      cursor: cursor ?? undefined,
    },
  });
}
