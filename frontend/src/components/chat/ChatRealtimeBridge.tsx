// frontend/src/components/chat/ChatRealtimeBridge.tsx

import { useCallback } from 'react';
import { useChatRealtime } from '@/hooks/useChatRealtime';

type Props = {
  chatId: string;

  /**
   * Inject message into existing chat state
   * (เช่น setMessages หรือ update store)
   */
  onMessageReceived: (message: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }) => void;
};

/**
 * This component has no UI
 * It only bridges realtime events to state
 */
export default function ChatRealtimeBridge({
  chatId,
  onMessageReceived,
}: Props) {
  const handleNewMessage = useCallback(
    (payload: {
      chatId: string;
      message: {
        id: string;
        senderId: string;
        content: string;
        createdAt: string;
      };
    }) => {
      if (payload.chatId !== chatId) return;
      onMessageReceived(payload.message);
    },
    [chatId, onMessageReceived],
  );

  useChatRealtime({
    chatId,
    onNewMessage: handleNewMessage,
  });

  return null; // no UI
}
