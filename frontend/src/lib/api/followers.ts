// frontend/src/lib/api/followers.ts
import { API_BASE } from '@/lib/api/api';

export type FollowersApiResponse = {
  items: {
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
    followedAt: string;
  }[];
  nextCursor: string | null;
};

export async function getFollowers(params: {
  userId: string;
  cursor?: string;
  limit?: number;
}): Promise<FollowersApiResponse> {
  const { userId, cursor, limit } = params;

  const query = new URLSearchParams();
  if (cursor) query.set('cursor', cursor);
  if (limit) query.set('limit', String(limit));

  const res = await fetch(
    `${API_BASE}/follow/${userId}?${query.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('FETCH_FOLLOWERS_FAILED');
  }

  return res.json();
}
