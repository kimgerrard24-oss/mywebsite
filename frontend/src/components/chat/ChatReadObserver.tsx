// frontend/src/components/chat/ChatReadObserver.tsx

import { useEffect } from 'react';
import { useChatRead } from '@/hooks/useChatRead';

type Props = {
  chatId: string;
};

/**
 * =====================================================
 * ChatReadObserver
 * - mount แล้ว mark read
 * - ใช้ได้กับ page / layout
 * =====================================================
 */
export default function ChatReadObserver({ chatId }: Props) {
  const { markRead } = useChatRead(chatId);

  useEffect(() => {
    markRead();
  }, [markRead]);

  return null;
}
