// frontend/src/hooks/useChatTyping.ts
import { useCallback, useRef } from 'react';
import { sendChatTyping } from '@/lib/api/chat-typing';

/**
 * debounce typing (default 400ms)
 */
export function useChatTyping(
  chatId: string,
  delayMs = 400,
) {
  const timerRef = useRef<NodeJS.Timeout | null>(
    null,
  );

  const notifyTyping = useCallback(() => {
    if (timerRef.current) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
    }, delayMs);

    sendChatTyping(chatId);
  }, [chatId, delayMs]);

  return { notifyTyping };
}
