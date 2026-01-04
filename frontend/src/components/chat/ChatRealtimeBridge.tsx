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
    console.log('[ChatRealtimeBridge] mount / chatId changed', {
      prev: chatIdRef.current,
      next: chatId,
    });

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
      if (!payload) {
        console.warn(
          '[ChatRealtimeBridge] new-message dropped: empty payload',
        );
        return;
      }

      if (payload.chatId !== chatIdRef.current) {
        console.warn(
          '[ChatRealtimeBridge] new-message dropped: chatId mismatch',
          {
            expected: chatIdRef.current,
            received: payload.chatId,
          },
        );
        return;
      }

      console.log(
        '[ChatRealtimeBridge] new-message received',
        {
          chatId: payload.chatId,
          messageId: payload.message?.id,
        },
      );

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

  /**
   * ===== Message deleted =====
   */
  const handleMessageDeleted = useCallback(
    (payload: {
      chatId: string;
      messageId: string;
    }) => {
      if (!payload) {
        console.warn(
          '[ChatRealtimeBridge] message-deleted dropped: empty payload',
        );
        return;
      }

      if (payload.chatId !== chatIdRef.current) {
        console.warn(
          '[ChatRealtimeBridge] message-deleted dropped: chatId mismatch',
          {
            expected: chatIdRef.current,
            received: payload.chatId,
          },
        );
        return;
      }

      console.log(
        '[ChatRealtimeBridge] message-deleted received',
        {
          chatId: payload.chatId,
          messageId: payload.messageId,
        },
      );

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

      if (!payload) {
        console.warn(
          '[ChatRealtimeBridge] typing dropped: empty payload',
        );
        return;
      }

      if (payload.chatId !== chatIdRef.current) {
        console.warn(
          '[ChatRealtimeBridge] typing dropped: chatId mismatch',
          {
            expected: chatIdRef.current,
            received: payload.chatId,
          },
        );
        return;
      }

      console.log(
        '[ChatRealtimeBridge] typing event received',
        payload,
      );

      onTyping(payload);
    },
    [onTyping],
  );

  console.log('[ChatRealtimeBridge] init useChatRealtime', {
    chatId,
  });

  useChatRealtime({
    chatId,
    onNewMessage: handleNewMessage,
    onMessageDeleted: handleMessageDeleted,
    onTyping: handleTyping,
  });

  return null;
}
