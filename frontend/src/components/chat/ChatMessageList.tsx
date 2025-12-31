// frontend/src/components/chat/ChatMessageList.tsx
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
} from "react";
import ChatMessageItem from "./ChatMessageItem";
import ChatMessageEmptyState from "./ChatMessageEmptyState";
import ChatMessageLoader from "./ChatMessageLoader";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessage } from "@/types/chat-message";

/**
 * UI-only extension
 * (ต้องตรงกับ ChatMessageItem)
 */
type ChatMessageUI = ChatMessage & {
  isDeleted?: boolean;
};

type Props = {
  chatId: string;
  initialData: {
    items: ChatMessageUI[];
    nextCursor: string | null;
  };

  /**
   * 🔔 Typing users (ephemeral, realtime)
   */
  typingUsers?: {
    userId: string;
    displayName: string | null;
  }[];
};

export type ChatMessageListHandle = {
  appendMessage: (msg: ChatMessageUI) => void;
  markMessageDeleted: (messageId: string) => void;
};

const ChatMessageList = forwardRef<
  ChatMessageListHandle,
  Props
>(function ChatMessageList(
  { chatId, initialData, typingUsers },
  ref,
) {
  /**
   * viewer (source of truth from auth context)
   */
  const { user } = useAuth();
  const viewerUserId = user?.id;

  /**
   * messages จาก GET (pagination) — read-only
   */
  const {
    items: fetchedItems,
    loadMore,
    hasMore,
    loading,
  } = useChatMessages({
    chatId,
    initialData,
  });

  const [appendedItems, setAppendedItems] =
    useState<ChatMessageUI[]>([]);
  const [patchedItems, setPatchedItems] =
    useState<Record<string, ChatMessageUI>>({});

  const bottomRef = useRef<HTMLDivElement | null>(
    null,
  );
  const lastMessageCountRef = useRef<number>(0);

  function markMessageDeleted(messageId: string) {
    setPatchedItems((prev) => {
      const base =
        prev[messageId] ??
        fetchedItems.find((m) => m.id === messageId) ??
        appendedItems.find((m) => m.id === messageId);

      return {
        ...prev,
        [messageId]: {
          ...(base ?? ({ id: messageId } as ChatMessageUI)),
          isDeleted: true,
        },
      };
    });
  }

  useImperativeHandle(ref, () => ({
    appendMessage(msg: ChatMessageUI) {
      setAppendedItems((prev) => {
        const index = prev.findIndex(
          (m) => m.id === msg.id,
        );

        if (index !== -1) {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            ...msg,
          };
          return copy;
        }

        return [...prev, msg];
      });
    },
    markMessageDeleted,
  }));

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  useEffect(() => {
  const totalMessages =
    fetchedItems.length + appendedItems.length;

  // scroll เฉพาะตอนมีข้อความใหม่จริง
  if (totalMessages > lastMessageCountRef.current) {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    lastMessageCountRef.current = totalMessages;
  }
}, [fetchedItems.length, appendedItems.length]);


  function handleDeletedMessage(messageId: string) {
    markMessageDeleted(messageId);
  }

  const mergedItems: ChatMessageUI[] = [
    ...[...fetchedItems]
      .reverse()
      .map((m) => patchedItems[m.id] ?? m),
    ...appendedItems.map(
      (m) => patchedItems[m.id] ?? m,
    ),
  ];

  if (mergedItems.length === 0) {
    return <ChatMessageEmptyState />;
  }

  return (
    <section
      className="flex flex-1 flex-col overflow-y-auto px-4 py-2"
      aria-label="Chat messages"
    >
      {mergedItems.map((msg) => (
        <ChatMessageItem
          key={msg.id}
          chatId={chatId}
          message={msg}
          isOwn={
            !!viewerUserId &&
            msg.sender.id === viewerUserId
          }
          onDeleted={handleDeletedMessage}
        />
      ))}

      {hasMore && (
        <ChatMessageLoader
          loading={loading}
          onLoadMore={loadMore}
        />
      )}

      {/* 🔔 Typing indicator (ephemeral, realtime) */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="mt-2 text-xs text-gray-400">
          {typingUsers
            .map(
              (u) => u.displayName ?? "Someone",
            )
            .join(", ")}{" "}
          is typing…
        </div>
      )}

      <div ref={bottomRef} />
    </section>
  );
});

export default ChatMessageList;
