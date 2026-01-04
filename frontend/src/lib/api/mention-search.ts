import { apiGet } from '@/lib/api/api';

export type MentionUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export async function mentionSearch(params: {
  q: string;
  limit?: number;
}): Promise<{ items: MentionUser[] }> {
  const { q, limit = 10 } = params;

  try {
    const res = await apiGet<MentionUser[]>(
      '/mentions/search',
      {
        params: { q, limit },
        withCredentials: true,
      },
    );

    return {
      items: Array.isArray(res) ? res : [],
    };
  } catch {
    // 🔒 mention ต้องไม่ทำให้ feed พัง
    return { items: [] };
  }
}
