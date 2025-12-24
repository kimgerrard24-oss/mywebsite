// frontend/src/lib/api/following.ts

import { API_BASE } from '@/lib/api/api';

export type FollowingApiResponse = {
  items: {
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
    followedAt: string;
  }[];
  nextCursor: string | null;
};

export async function getFollowing(params: {
  userId: string;
  cursor?: string;
  limit?: number;
}): Promise<FollowingApiResponse> {
  const { userId, cursor, limit } = params;

  const query = new URLSearchParams();
  if (cursor) query.set('cursor', cursor);
  if (limit) query.set('limit', String(limit));

  const res = await fetch(
    `${API_BASE}/following/${userId}?${query.toString()}`,
    {
      method: 'GET',
      credentials: 'include', // ✅ HttpOnly cookie
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    throw new Error('FETCH_FOLLOWING_FAILED');
  }

  return res.json();
}
