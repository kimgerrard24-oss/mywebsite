// frontend/pages/chat/[chatId].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useRef, useCallback, useState } from "react";
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
import ChatTypingIndicator from "@/components/chat/ChatTypingIndicator";

import ChatRealtimeBridge from "@/components/chat/ChatRealtimeBridge";
import { useAuth } from "@/hooks/useAuth";
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

type TypingUser = {
  userId: string;
  displayName: string | null;
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

  const { user } = useAuth();
  const viewerUserId = user?.id;

  /**
   * ===== Typing state =====
   */
  const [typingUsers, setTypingUsers] =
    useState<TypingUser[]>([]);

  /**
   * 🔔 Realtime: new message
   */
  const handleRealtimeMessage = useCallback(
    (msg: ChatMessage) => {
      listRef.current?.appendMessage(msg);

      // clear typing only for sender
      setTypingUsers((prev) =>
        prev.filter(
          (u) => u.userId !== msg.sender.id,
        ),
      );
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
   * 🔔 Realtime: typing
   * payload: { chatId, userId, isTyping }
   */
  const handleRealtimeTyping = useCallback(
    (payload: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (payload.chatId !== meta.id) return;

      // do not show self typing
      if (payload.userId === viewerUserId) {
        return;
      }

      setTypingUsers((prev) => {
        if (payload.isTyping) {
          if (prev.some((u) => u.userId === payload.userId)) {
            return prev;
          }

          return [
            ...prev,
            {
              userId: payload.userId,
              displayName: meta.peer?.displayName ?? null,
            },
          ];
        }

        return prev.filter(
          (u) => u.userId !== payload.userId,
        );
      });
    },
    [meta.id, meta.peer?.displayName, viewerUserId],
  );

  /**
   * POST success (authoritative)
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

      <ChatLayout
  header={
    <ChatPermissionGuard meta={meta}>
      <ChatHeader meta={meta} />
    </ChatPermissionGuard>
  }
  messages={
    <>
    
      <ChatMessageList
  ref={listRef}
  chatId={meta.id}
  initialData={initialMessages}
  typingUsers={typingUsers}
      />

      <ChatRealtimeBridge
        chatId={meta.id}
        onMessageReceived={handleRealtimeMessage}
        onMessageDeleted={handleRealtimeDeleted}
        onTyping={handleRealtimeTyping}
      />

      <ChatReadObserver chatId={meta.id} />
    </>
  }
  composer={
    <ChatComposer
      chatId={meta.id}
      onMessageSent={handleMessageSent}
    />
  }
/>

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
