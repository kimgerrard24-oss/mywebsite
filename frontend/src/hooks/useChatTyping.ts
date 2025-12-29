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
  // ✅ browser-safe timeout type
  const idleTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const isTypingRef = useRef(false);

  const notifyTyping = useCallback(() => {
    // send "start typing" only once
    if (!isTypingRef.current) {
      isTypingRef.current = true;

      // fire-and-forget (do not await)
      sendChatTyping(chatId, true);
    }

    // reset idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      // send "stop typing" after idle
      isTypingRef.current = false;
      idleTimerRef.current = null;

      sendChatTyping(chatId, false);
    }, idleMs);
  }, [chatId, idleMs]);

  /**
   * Cleanup on unmount / chatId change
   * ensure stop-typing is sent
   */
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendChatTyping(chatId, false);
      }
    };
  }, [chatId]);

  return { notifyTyping };
}
