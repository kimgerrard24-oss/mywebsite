// frontend/src/lib/api/chat.ts

import { api, client } from "@/lib/api/api";

/**
 * ==============================
 * SSR: GET /chat/:userId
 * ใช้ใน getServerSideProps
 * ==============================
 */
export async function getChatByUserId(params: {
  userId: string;
  cookie: string;
}) {
  const res = await api.get(`/chat/${params.userId}`, {
    headers: {
      cookie: params.cookie,
    },
    withCredentials: true,
  });

  return res.data;
}

/**
 * ==============================
 * SSR: GET /chat/rooms
 * Chat Inbox
 * ==============================
 */
export async function getChatRooms(params: {
  cookie: string;
}) {
  const res = await api.get("/chat/rooms", {
    headers: {
      cookie: params.cookie,
    },
    withCredentials: true,
  });

  return res.data;
}

/**
 * ==============================
 * CSR (optional): GET /chat/rooms
 * ใช้หลัง hydration / client navigation
 * ==============================
 */
export async function getChatRoomsClient() {
  return client.get("/chat/rooms");
}

export async function getChatMeta(params: {
  chatId: string;
  cookie: string;
}) {
  const res = await api.get(`/chat/${params.chatId}/meta`, {
    headers: {
      cookie: params.cookie,
    },
    withCredentials: true,
  });

  return res.data;
}

