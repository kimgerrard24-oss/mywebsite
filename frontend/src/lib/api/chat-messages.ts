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

/**
 * CSR: POST /chat/:chatId/messages
 */
export async function sendChatMessage(params: {
  chatId: string;
  content?: string;
  mediaIds?: string[];
}): Promise<ChatMessage> {
  const { chatId, content, mediaIds } = params;

  return client.post<ChatMessage>(
    `/chat/${chatId}/messages`,
    {
      ...(typeof content === "string" && content.trim()
        ? { content: content.trim() }
        : {}),
      ...(Array.isArray(mediaIds) && mediaIds.length > 0
        ? { mediaIds }
        : {}),
    },
  );
}


/**
 * CSR: PATCH /chat/:chatId/messages/:messageId
 * ⚠️ ใช้ api เพราะ client ไม่มี patch
 */
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

/**
 * CSR: DELETE /chat/:chatId/messages/:messageId
 * ⚠️ ใช้ api เพราะ client ไม่มี delete
 */
// frontend/src/lib/api/chat-messages.ts

export async function deleteChatMessage(params: {
  chatId: string;
  messageId: string;
}): Promise<ChatMessage> {
  const { chatId, messageId } = params;

  const res = await api.delete<ChatMessage>(
    `/chat/${chatId}/messages/${messageId}`,
    {
      withCredentials: true,
    },
  );

  return res.data;
}


/**
 * CSR: GET /chat/:chatId/messages/:messageId
 * ใช้สำหรับ refetch message ที่ media attach เสร็จแล้ว
 */
export async function getChatMessageById(params: {
  chatId: string;
  messageId: string;
}): Promise<ChatMessage> {
  const { chatId, messageId } = params;

  return client.get(
    `/chat/${chatId}/messages/${messageId}`,
  );
}


