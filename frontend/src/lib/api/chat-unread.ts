// frontend/src/lib/api/chat-unread.ts

import { api, client } from "@/lib/api/api";

/**
 * ==============================
 * SSR: GET /chat/:chatId/unread-count
 * ใช้ใน getServerSideProps (chat list)
 * ==============================
 */
export async function getChatUnreadCountSSR(params: {
  chatId: string;
  cookie: string;
}): Promise<{ unreadCount: number }> {
  const res = await api.get(
    `/chat/${params.chatId}/unread-count`,
    {
      headers: {
        cookie: params.cookie,
      },
      withCredentials: true,
    },
  );

  return res.data;
}

/**
 * ==============================
 * CSR: GET /chat/:chatId/unread-count
 * ใช้หลัง hydration / realtime refresh
 * ==============================
 */
export async function getChatUnreadCountClient(
  chatId: string,
): Promise<{ unreadCount: number }> {
  return client.get(`/chat/${chatId}/unread-count`);
}
