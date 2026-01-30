// frontend/src/hooks/useChatUnreadCount.ts

import { useEffect, useState, useRef } from "react";
import { getChatUnreadCountClient } from "@/lib/api/chat-unread";

export function useChatUnreadCount(chatId: string) {
  const [unreadCount, setUnreadCount] =
    useState<number>(0);
  const [loading, setLoading] = useState(true);

  const activeChatIdRef = useRef<string | null>(null);

  async function refresh() {
    if (!chatId) return;

    const currentChatId = chatId;
    activeChatIdRef.current = currentChatId;

    setLoading(true);

    try {
      const res =
        await getChatUnreadCountClient(currentChatId);

      // prevent stale response overwrite
      if (activeChatIdRef.current === currentChatId) {
        setUnreadCount(res.unreadCount);
      }
    } finally {
      if (activeChatIdRef.current === currentChatId) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    refresh();
  }, [chatId]);

  return {
    unreadCount,
    loading,
    refresh,
  };
}
