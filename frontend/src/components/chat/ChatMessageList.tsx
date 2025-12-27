import {
  forwardRef,
  useImperativeHandle,
  useState,
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
   * - appended: POST
   * - patched: EDIT / DELETE
   */
  const [appendedItems, setAppendedItems] =
    useState<ChatMessageUI[]>([]);
  const [patchedItems, setPatchedItems] =
    useState<Record<string, ChatMessageUI>>(
      {},
    );

  /**
   * expose method ให้ parent
   */
  useImperativeHandle(ref, () => ({
    appendMessage(msg: ChatMessageUI) {
      setAppendedItems((prev) => [
        ...prev,
        msg,
      ]);
    },
  }));

  /**
   * EDIT (overlay)
   */
  function handleEditedMessage(
    updated: ChatMessageUI,
  ) {
    setPatchedItems((prev) => ({
      ...prev,
      [updated.id]: updated,
    }));
  }

  /**
   * DELETE (overlay, fail-soft)
   */
  function handleDeletedMessage(
    messageId: string,
  ) {
    setPatchedItems((prev) => {
      const base =
        prev[messageId] ??
        fetchedItems.find(
          (m) => m.id === messageId,
        ) ??
        appendedItems.find(
          (m) => m.id === messageId,
        );

      if (!base) return prev;

      return {
        ...prev,
        [messageId]: {
          ...base,
          isDeleted: true,
        },
      };
    });
  }

  /**
   * merge:
   * fetched → patched → appended
   */
  const mergedItems: ChatMessageUI[] = [
    ...fetchedItems.map(
      (m) => patchedItems[m.id] ?? m,
    ),
    ...appendedItems.map(
      (m) => patchedItems[m.id] ?? m,
    ),
  ];

  if (mergedItems.length === 0) {
    return <ChatMessageEmptyState />;
  }

  return (
    <section
      className="flex flex-1 flex-col-reverse overflow-y-auto px-4 py-2"
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
          onEdited={handleEditedMessage}
          onDeleted={handleDeletedMessage}
        />
      ))}

      {hasMore && (
        <ChatMessageLoader
          loading={loading}
          onLoadMore={loadMore}
        />
      )}
    </section>
  );
});

export default ChatMessageList;
