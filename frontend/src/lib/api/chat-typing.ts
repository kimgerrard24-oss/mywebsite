// frontend/src/lib/api/chat-typing.ts
import { api } from '@/lib/api/api';

/**
 * POST /chat/:chatId/typing
 * fire-and-forget
 */
export async function sendChatTyping(
  chatId: string,
): Promise<void> {
  try {
    await api.post(
      `/chat/${chatId}/typing`,
      {},
      {
        withCredentials: true,
      },
    );
  } catch {
    /**
     * typing เป็น ephemeral
     * ห้าม throw error รบกวน UX
     */
  }
}
