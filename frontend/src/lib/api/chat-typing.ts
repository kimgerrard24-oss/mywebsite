// frontend/src/lib/api/chat-typing.ts
import { api } from '@/lib/api/api';

/**
 * POST /chat/:chatId/typing
 * fire-and-forget (ephemeral)
 */
export async function sendChatTyping(
  chatId: string,
  isTyping: boolean,
): Promise<void> {
  try {
    await api.post(
      `/chat/${chatId}/typing`,
      { isTyping },
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
