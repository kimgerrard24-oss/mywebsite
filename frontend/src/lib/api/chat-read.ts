// frontend/src/lib/api/chat-read.ts

import { api } from '@/lib/api/api';

/**
 * =====================================================
 * POST /chat/:chatId/read
 * - CSR only
 * - backend เป็น authority
 * =====================================================
 */
export async function markChatAsRead(chatId: string): Promise<void> {
  await api.post(
    `/chat/${chatId}/read`,
    {},
    {
      withCredentials: true, // HttpOnly cookie
    },
  );
}
