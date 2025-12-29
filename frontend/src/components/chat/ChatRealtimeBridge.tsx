// frontend/src/components/chat/ChatRealtimeBridge.tsx

import { useCallback, useEffect, useRef } from 'react';
import { useChatRealtime } from '@/hooks/useChatRealtime';
import type { ChatMessage } from '@/types/chat-message';

type Props = {
  chatId: string;

  /**
   * Inject message into existing chat state
   * (เช่น ChatMessageList.appendMessage)
   */
  onMessageReceived: (message: ChatMessage) => void;

  /**
   * Mark message as deleted in existing chat state
   */
  onMessageDeleted: (messageId: string) => void;
};

/**
 * This component has no UI
 * It only bridges realtime events to state
 */
export default function ChatRealtimeBridge({
  chatId,
  onMessageReceived,
  onMessageDeleted,
}: Props) {
  /**
   * ensure handlers are stable per chatId lifecycle
   */
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  const handleNewMessage = useCallback(
    (payload: {
      chatId: string;
      message: ChatMessage;
    }) => {
      if (!payload) return;
      if (payload.chatId !== chatIdRef.current) return;

      /**
       * IMPORTANT (production-grade):
       * Normalize realtime message to ensure:
       * - new object reference
       * - media always exists (image / audio support)
       * - consistent shape with REST responses
       */
      const normalizedMessage: ChatMessage = {
        ...payload.message,
        media: Array.isArray(payload.message.media)
          ? payload.message.media
          : [],
      };

      onMessageReceived(normalizedMessage);
    },
    [onMessageReceived],
  );

  const handleMessageDeleted = useCallback(
    (payload: {
      chatId: string;
      messageId: string;
    }) => {
      if (!payload) return;
      if (payload.chatId !== chatIdRef.current) return;

      onMessageDeleted(payload.messageId);
    },
    [onMessageDeleted],
  );

  useChatRealtime({
    chatId,
    onNewMessage: handleNewMessage,
    onMessageDeleted: handleMessageDeleted,
  });

  return null;
}
