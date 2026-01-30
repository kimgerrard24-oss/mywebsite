// frontend/src/components/chat/ChatReadObserver.tsx

import { useEffect, useRef } from "react";
import { useChatRead } from "@/hooks/useChatRead";

type Props = {
  chatId: string;
};

/**
 * =====================================================
 * ChatReadObserver
 * - mark chat as read when entering room
 * - backend is authority
 * =====================================================
 */
export default function ChatReadObserver({ chatId }: Props) {
  const { markRead } = useChatRead(chatId);

  const hasMarkedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chatId) return;

    // prevent duplicate mark-read for same chat
    if (hasMarkedRef.current === chatId) return;

    hasMarkedRef.current = chatId;
    markRead();
  }, [chatId, markRead]);

  return null;
}

