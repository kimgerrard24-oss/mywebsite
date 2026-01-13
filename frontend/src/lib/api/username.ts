// frontend/src/lib/api/username.ts

import { api } from '@/lib/api/api';

export type UsernameAvailableResult = {
  available: boolean;
  reason?: 'reserved' | 'reserved_prefix';
};

export async function checkUsernameAvailable(
  username: string,
): Promise<UsernameAvailableResult> {
  const res = await api.get<UsernameAvailableResult>(
    '/users/username-available',
    {
      params: { u: username },
      withCredentials: true, // cookie still sent, but route is public
    },
  );

  return res.data;
}
