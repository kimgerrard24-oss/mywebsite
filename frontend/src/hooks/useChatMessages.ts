// frontend/src/hooks/useChatMessages.ts

import { useEffect, useState } from "react";
import { getChatMessagesClient } from "@/lib/api/chat-messages";
import type { ChatMessage } from "@/types/chat-message";

export function useChatMessages(params: {
  chatId: string;
  initialData: {
    items: ChatMessage[];
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

  // =========================
  // Append message (authoritative)
  // =========================
  function appendMessage(message: ChatMessage) {
    setItems((prev) => {
      // 🔒 guard: prevent duplicate
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }

      return [...prev, message];
    });
  }

  // =========================
  // Listen for local share append (sender side)
  // =========================
  useEffect(() => {
    function onAppend(e: Event) {
      const detail = (e as CustomEvent).detail as
        | ChatMessage
        | undefined;

      if (!detail) return;

      // ✅ ensure message belongs to this chat
      if (detail.chatId !== params.chatId) return;

      appendMessage(detail);
    }

    window.addEventListener(
      "chat:append-message",
      onAppend,
    );

    return () => {
      window.removeEventListener(
        "chat:append-message",
        onAppend,
      );
    };
  }, [params.chatId]);

  // =========================
  // Pagination (unchanged)
  // =========================
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
