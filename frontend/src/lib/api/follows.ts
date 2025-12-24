// frontend/src/lib/api/follows.ts

import { API_BASE } from '@/lib/api/api'; // ใช้ unified API client ของคุณ

export async function followUser(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/follow/${userId}`, {
    method: 'POST',
    credentials: 'include', 
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error('ALREADY_FOLLOWING');
    }

    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    throw new Error('FOLLOW_FAILED');
  }
}

export async function unfollowUser(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/unfollow/${userId}`, {
    method: 'DELETE',
    credentials: 'include', // ✅ HttpOnly cookie
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    if (res.status === 409) {
      throw new Error('NOT_FOLLOWING');
    }

    throw new Error('UNFOLLOW_FAILED');
  }
}

