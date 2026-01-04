// frontend/src/lib/api/mention-search.ts

import { apiGet } from '@/lib/api/api';

export type MentionUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

/**
 * Mention search API
 *
 * Backend endpoint:
 *   GET /mentions/search
 *
 * - ต้อง login
 * - ใช้ HttpOnly cookie
 */
export async function mentionSearch(params: {
  q: string;
  limit?: number;
}): Promise<{ items: MentionUser[] }> {
  const { q, limit = 10 } = params;

  return apiGet<{ items: MentionUser[] }>(
    '/mentions/search',
    {
      params: {
        q,
        limit,
      },
      withCredentials: true, // 🔒 HttpOnly cookie auth
    },
  );
}
