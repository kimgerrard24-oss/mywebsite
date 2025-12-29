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

import ChatRealtimeBridge from "@/components/chat/ChatRealtimeBridge";
import type { ChatMessage } from "@/types/chat-message";

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
  const listRef = useRef<ChatMessageListHandle>(null);

  /**
   * 🔔 Realtime: new message (delivery only)
   */
  const handleRealtimeMessage = useCallback(
    (msg: ChatMessage) => {
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

  /**
   * POST success (authoritative message from backend)
   * Must append immediately (do not wait for realtime)
   */
  const handleMessageSent = useCallback(
    (message: ChatMessage) => {
      listRef.current?.appendMessage(message);
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

          <ChatMessageList
            ref={listRef}
            chatId={meta.id}
            initialData={initialMessages}
          />

          <ChatRealtimeBridge
            chatId={meta.id}
            onMessageReceived={handleRealtimeMessage}
            onMessageDeleted={handleRealtimeDeleted}
          />

          <ChatReadObserver chatId={meta.id} />

          <ChatComposer
            chatId={meta.id}
            onMessageSent={handleMessageSent}
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
    const redirect = await requireSessionSSR(ctx);
    if (redirect) return redirect;

    const id = ctx.params?.chatId as string;

    try {
      const [meta, messages] = await Promise.all([
        getChatMeta({
          chatId: id,
          cookie: ctx.req.headers.cookie ?? "",
        }),
        getChatMessagesSSR({
          chatId: id,
          cookie: ctx.req.headers.cookie ?? "",
        }),
      ]);

      return {
        props: {
          meta,
          initialMessages: messages,
        },
      };
    } catch {
      try {
        const chat = await getChatByUserId({
          userId: id,
          cookie: ctx.req.headers.cookie ?? "",
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
