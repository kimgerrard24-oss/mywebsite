// frontend/src/hooks/useChatTyping.ts

import { useCallback, useEffect, useRef } from 'react';
import { sendChatTyping } from '@/lib/api/chat-typing';

/**
 * Typing notifier (production-grade)
 * - send isTyping: true on first input
 * - auto send isTyping: false after idle
 * - fire-and-forget (ephemeral)
 * - compatible with ChatRealtimeBridge
 */
export function useChatTyping(
  chatId: string,
  idleMs = 2000,
) {
  const idleTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyTyping = useCallback(() => {
    // 🔔 send typing heartbeat EVERY time
    sendChatTyping(chatId, true);

    // reset idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      idleTimerRef.current = null;
      sendChatTyping(chatId, false);
    }, idleMs);
  }, [chatId, idleMs]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
        sendChatTyping(chatId, false);
      }
    };
  }, [chatId]);

  return { notifyTyping };
}
