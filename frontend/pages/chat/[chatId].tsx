// frontend/pages/chat/[chatId].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useRef, useCallback } from "react";
import { requireSessionSSR } from "@/lib/auth/require-session-ssr";
import {
  getChatMeta,
  getChatByUserId,
} from "@/lib/api/chat";
import { getChatMessagesSSR } from "@/lib/api/chat-messages";

import ChatLayout from "@/components/chat/ChatLayout";
import ChatHeader from "@/components/chat/ChatHeaderByMeta";
import ChatPermissionGuard from "@/components/chat/ChatPermissionGuard";
import ChatMessageList, {
  type ChatMessageListHandle,
} from "@/components/chat/ChatMessageList";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatReadObserver from "@/components/chat/ChatReadObserver";
import ChatMessageComposer from "@/components/chat/ChatMessageComposer";

// 🔔 Realtime
import ChatRealtimeBridge from "@/components/chat/ChatRealtimeBridge";

/**
 * ==============================
 * Types
 * ==============================
 */
type ChatMeta = {
  id: string;
  isGroup: boolean;
  peer: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
};

type ChatMessages = {
  items: any[];
  nextCursor: string | null;
};

type Props = {
  meta: ChatMeta;
  initialMessages: ChatMessages;
};

/**
 * ==============================
 * Page
 * ==============================
 */
export default function ChatPage({
  meta,
  initialMessages,
}: Props) {
  const listRef =
    useRef<ChatMessageListHandle>(null);

  /**
   * 🔔 Realtime: new message
   */
  const handleRealtimeMessage = useCallback(
    (msg: any) => {
      listRef.current?.appendMessage(msg);
    },
    [],
  );

  /**
   * 🔔 Realtime: message deleted
   */
  const handleRealtimeDeleted = useCallback(
    (messageId: string) => {
    listRef.current?.markMessageDeleted(messageId);
    },
    [],
  );

  return (
    <>
      <Head>
        <title>
          {meta.peer?.displayName
            ? `${meta.peer.displayName} | Chat`
            : "Chat"}{" "}
          | PhlyPhant
        </title>
      </Head>

      <ChatLayout>
        <ChatPermissionGuard meta={meta}>
          <ChatHeader meta={meta} />

          {/* =========================
              🔔 Realtime Bridge
              - delivery only
              - no UI
              ========================= */}
          {/* ...Head / Layout / Header เหมือนเดิม */}

      <ChatRealtimeBridge
        chatId={meta.id}
        onMessageReceived={handleRealtimeMessage}
        onMessageDeleted={handleRealtimeDeleted}
      />

      <ChatMessageList
        ref={listRef}
        chatId={meta.id}
        initialData={initialMessages}
      />

          {/* =========================
              Read Observer
              - POST /chat/:chatId/read
              ========================= */}
          <ChatReadObserver chatId={meta.id} />

          {/* =========================
              Chat Composer
              - POST /chat/:chatId/messages
              ========================= */}
          <ChatComposer
            chatId={meta.id}
            onMessageSent={(msg) => {
              // เดิม: optimistic update
              listRef.current?.appendMessage(
                msg,
              );
            }}
          />
        </ChatPermissionGuard>
      </ChatLayout>
    </>
  );
}

/**
 * ==============================
 * SSR
 * ==============================
 */
export const getServerSideProps: GetServerSideProps =
  async (ctx) => {
    const redirect =
      await requireSessionSSR(ctx);
    if (redirect) return redirect;

    const id =
      ctx.params?.chatId as string;

    /**
     * Flow (สำคัญ):
     * 1) ลองมองว่า id คือ chatId ก่อน
     * 2) ถ้าไม่ใช่ → ถือว่าเป็น userId
     * 3) backend เป็นคนตัดสิน + redirect
     */
    try {
      // 1️⃣ ลองโหลดแบบ chatId
      const [meta, messages] =
        await Promise.all([
          getChatMeta({
            chatId: id,
            cookie:
              ctx.req.headers.cookie ?? "",
          }),
          getChatMessagesSSR({
            chatId: id,
            cookie:
              ctx.req.headers.cookie ?? "",
          }),
        ]);

      return {
        props: {
          meta,
          initialMessages: messages,
        },
      };
    } catch {
      // 2️⃣ ถ้าไม่ใช่ chatId → userId
      try {
        const chat =
          await getChatByUserId({
            userId: id,
            cookie:
              ctx.req.headers.cookie ?? "",
          });

        return {
          redirect: {
            destination: `/chat/${chat.id}`,
            permanent: false,
          },
        };
      } catch {
        return { notFound: true };
      }
    }
  };

