// frontend/src/lib/api/chat-messages.ts
import { api, client } from "@/lib/api/api";
import type { ChatMessage } from "@/types/chat-message";

/**
 * SSR: GET /chat/:chatId/messages
 */
export async function getChatMessagesSSR(params: {
  chatId: string;
  cookie: string;
  cursor?: string | null;
}) {
  const res = await api.get(
    `/chat/${params.chatId}/messages`,
    {
      params: {
        cursor: params.cursor ?? undefined,
      },
      headers: {
        cookie: params.cookie,
      },
      withCredentials: true,
    },
  );

  return res.data;
}

/**
 * CSR: GET /chat/:chatId/messages
 */
export async function getChatMessagesClient(params: {
  chatId: string;
  cursor?: string | null;
}) {
  return client.get(
    `/chat/${params.chatId}/messages${
      params.cursor ? `?cursor=${params.cursor}` : ""
    }`,
  );
}

export async function sendChatMessage(params: {
  chatId: string;
  content: string;
}) {
  const res = await api.post(
    `/chat/${params.chatId}/messages`,
    {
      content: params.content,
    },
    {
      withCredentials: true,
    },
  );

  return res.data;
}

export async function editChatMessage(params: {
  chatId: string;
  messageId: string;
  content: string;
}): Promise<ChatMessage> {
  const { chatId, messageId, content } = params;

  const res = await api.patch(
    `/chat/${chatId}/messages/${messageId}`,
    { content },
    { withCredentials: true },
  );

  return res.data;
}

export async function deleteChatMessage(params: {
  chatId: string;
  messageId: string;
  reason?: string;
}): Promise<ChatMessage> {
  const { chatId, messageId, reason } = params;

  const res = await api.delete(
    `/chat/${chatId}/messages/${messageId}`,
    {
      // ✅ ส่ง data เสมอ เพื่อให้ axios dispatch request แน่นอน
      data: { reason: reason ?? null },
      withCredentials: true,
    },
  );

  return res.data;
}
