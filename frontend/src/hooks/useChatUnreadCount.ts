// frontend/src/hooks/useChatUnreadCount.ts

import { useEffect, useState } from "react";
import { getChatUnreadCountClient } from "@/lib/api/chat-unread";

export function useChatUnreadCount(chatId: string) {
  const [unreadCount, setUnreadCount] =
    useState<number>(0);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res =
        await getChatUnreadCountClient(chatId);
      setUnreadCount(res.unreadCount);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [chatId]);

  return {
    unreadCount,
    loading,
    refresh, // เผื่อ socket / manual refresh
  };
}
