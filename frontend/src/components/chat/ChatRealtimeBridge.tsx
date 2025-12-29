// frontend/src/components/chat/ChatRealtimeBridge.tsx

import { useCallback, useEffect, useRef } from 'react';
import { useChatRealtime } from '@/hooks/useChatRealtime';
import type { ChatMessage } from '@/types/chat-message';

type Props = {
  chatId: string;

  /**
   * Inject message into existing chat state
   */
  onMessageReceived: (message: ChatMessage) => void;

  /**
   * Mark message as deleted in existing chat state
   */
  onMessageDeleted: (messageId: string) => void;

  /**
   * Typing indicator (ephemeral)
   */
  onTyping?: (payload: {
    chatId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
};

/**
 * This component has no UI
 * It only bridges realtime events to state
 */
export default function ChatRealtimeBridge({
  chatId,
  onMessageReceived,
  onMessageDeleted,
  onTyping,
}: Props) {
  /**
   * ensure handlers are stable per chatId lifecycle
   */
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  /**
   * ===== New message =====
   */
  const handleNewMessage = useCallback(
    (payload: {
      chatId: string;
      message: ChatMessage;
    }) => {
      if (!payload) return;
      if (payload.chatId !== chatIdRef.current) return;

      const normalizedMessage: ChatMessage = {
        ...payload.message,
        media: Array.isArray(payload.message.media)
          ? payload.message.media
          : [],
      };

      // guard: prevent incomplete media render
      if (
        normalizedMessage.media.length > 0 &&
        normalizedMessage.media.some(
          (m) =>
            !m ||
            typeof m.url !== 'string' ||
            m.url.length === 0,
        )
      ) {
        return;
      }

      onMessageReceived(normalizedMessage);
    },
    [onMessageReceived],
  );

  /**
   * ===== Message deleted =====
   */
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

  /**
   * ===== Typing (ephemeral) =====
   */
  const handleTyping = useCallback(
    (payload: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (!onTyping) return;
      if (!payload) return;
      if (payload.chatId !== chatIdRef.current) return;

      onTyping(payload);
    },
    [onTyping],
  );

  useChatRealtime({
    chatId,
    onNewMessage: handleNewMessage,
    onMessageDeleted: handleMessageDeleted,
    onTyping: handleTyping,
  });

  return null;
}
