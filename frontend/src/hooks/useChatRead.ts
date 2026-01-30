// frontend/src/hooks/useChatRead.ts
import { useCallback, useRef } from 'react';
import { markChatAsRead } from '@/lib/api/chat-read';

/**
 * =====================================================
 * useChatRead
 * - debounce กันยิงซ้ำ
 * - fail-soft (ไม่พัง UI)
 * =====================================================
 */
export function useChatRead(chatId: string) {
  const calledRef = useRef(false);

  const markRead = useCallback(async () => {
    if (calledRef.current) return;

    calledRef.current = true;

    try {
      await markChatAsRead(chatId);
    } catch {
      /**
       * fail-soft:
       * - backend อาจ reject
       * - ไม่ต้อง rollback UI
       */
    }
  }, [chatId]);

  return { markRead };
}
