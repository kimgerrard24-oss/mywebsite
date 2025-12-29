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
};

/**
 * Methods ที่ page / composer สามารถเรียกใช้ได้
 */
export type ChatMessageListHandle = {
  appendMessage: (msg: ChatMessageUI) => void;
  markMessageDeleted: (messageId: string) => void;
};

const ChatMessageList = forwardRef<
  ChatMessageListHandle,
  Props
>(function ChatMessageList(
  { chatId, initialData },
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

  /**
   * overlay state
   * - appended: POST / realtime
   * - patched: DELETE
   */
  const [appendedItems, setAppendedItems] =
    useState<ChatMessageUI[]>([]);
  const [patchedItems, setPatchedItems] =
    useState<Record<string, ChatMessageUI>>({});

  /**
   * scroll anchor
   */
  const bottomRef = useRef<HTMLDivElement | null>(
    null,
  );

  /**
   * internal delete handler (single source of truth)
   */
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

  /**
   * expose method ให้ parent
   */
  useImperativeHandle(ref, () => ({
    appendMessage(msg: ChatMessageUI) {
      setAppendedItems((prev) => {
        const index = prev.findIndex(
          (m) => m.id === msg.id,
        );

        // 🔒 Patch existing message (media may arrive later)
        if (index !== -1) {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            ...msg,
          };
          return copy;
        }

        // ➕ New message
        return [...prev, msg];
      });
    },
    markMessageDeleted,
  }));

  /**
   * initial scroll after hydration
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  /**
   * auto scroll to bottom on new message
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [fetchedItems.length, appendedItems.length]);

  /**
   * DELETE (overlay)
   */
  function handleDeletedMessage(messageId: string) {
    markMessageDeleted(messageId);
  }

  /**
   * merge:
   * fetched (ASC) → patched → appended
   */
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

      <div ref={bottomRef} />
    </section>
  );
});

export default ChatMessageList;
