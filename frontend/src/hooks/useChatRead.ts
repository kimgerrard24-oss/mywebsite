// frontend/src/hooks/useChatRead.ts
import { useCallback, useRef, useEffect } from "react";
import { markChatAsRead } from "@/lib/api/chat-read";

/**
 * =====================================================
 * useChatRead
 * - debounce per chatId
 * - fail-soft
 * - backend is authority
 * =====================================================
 */
export function useChatRead(chatId: string) {
  const calledChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    // reset debounce when chatId changes
    calledChatIdRef.current = null;
  }, [chatId]);

  const markRead = useCallback(async () => {
    if (!chatId) return;

    if (calledChatIdRef.current === chatId) return;

    calledChatIdRef.current = chatId;

    try {
      await markChatAsRead(chatId);

// notify frontend that this chat is read
if (typeof window !== "undefined") {
  window.dispatchEvent(
    new CustomEvent("chat:read", {
      detail: { chatId },
    }),
  );
}

    } catch {
      // fail-soft
    }
  }, [chatId]);

  return { markRead };
}

