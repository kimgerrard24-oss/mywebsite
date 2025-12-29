// frontend/src/hooks/useChatMessages.ts
import { useState } from "react";
import { getChatMessagesClient } from "@/lib/api/chat-messages";
import type { ChatMessage } from "@/types/chat-message";

export function useChatMessages(params: {
  chatId: string;
  initialData: {
    items: ChatMessage[]
    nextCursor: string | null;
  };
}) {
  const [items, setItems] = useState(
    params.initialData.items,
  );
  const [cursor, setCursor] = useState(
    params.initialData.nextCursor,
  );
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;

    setLoading(true);
    try {
      const res = await getChatMessagesClient({
        chatId: params.chatId,
        cursor,
      });

      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  return {
    items,
    loading,
    hasMore: Boolean(cursor),
    loadMore,
  };
}
