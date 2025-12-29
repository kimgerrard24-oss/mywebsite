// frontend/src/hooks/useChatRealtime.ts

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import type { ChatMessage } from '@/types/chat-message';

type NewMessagePayload = {
  chatId: string;
  message: ChatMessage;
};

type MessageDeletedPayload = {
  chatId: string;
  messageId: string;
};

type TypingPayload = {
  chatId: string;
  userId: string;
  isTyping: boolean;
};

type Params = {
  chatId: string;

  onNewMessage: (payload: NewMessagePayload) => void;

  onMessageDeleted?: (
    payload: MessageDeletedPayload,
  ) => void;

  /**
   * Typing indicator (ephemeral)
   */
  onTyping?: (payload: TypingPayload) => void;
};

export function useChatRealtime({
  chatId,
  onNewMessage,
  onMessageDeleted,
  onTyping,
}: Params) {
  useEffect(() => {
    const socket = getSocket();

    /**
     * Join chat room with ACK
     * Subscribe events only after join success
     */
    const joinChat = () => {
      socket.emit(
        'chat:join',
        { chatId },
        (ack: { joined?: boolean }) => {
          if (!ack?.joined) {
            console.warn(
              'Failed to join chat room',
              chatId,
            );
            return;
          }

          // ===== New message =====
          socket.off('chat:new-message', onNewMessage);
          socket.on('chat:new-message', onNewMessage);

          // ===== Message deleted =====
          if (onMessageDeleted) {
            socket.off(
              'chat:message-deleted',
              onMessageDeleted,
            );
            socket.on(
              'chat:message-deleted',
              onMessageDeleted,
            );
          }

          // ===== Typing (ephemeral) =====
          if (onTyping) {
            socket.off('chat:typing', onTyping);
            socket.on('chat:typing', onTyping);
          }

          console.log('Joined chat room', chatId);
        },
      );
    };

    /**
     * Ensure socket connection
     */
    if (!socket.connected) {
      socket.connect();
    }

    /**
     * Join immediately if already connected
     */
    if (socket.connected) {
      joinChat();
    }

    /**
     * Re-join on every reconnect
     */
    socket.on('connect', joinChat);

    return () => {
      socket.off('connect', joinChat);

      socket.off('chat:new-message', onNewMessage);

      if (onMessageDeleted) {
        socket.off(
          'chat:message-deleted',
          onMessageDeleted,
        );
      }

      if (onTyping) {
        socket.off('chat:typing', onTyping);
      }

      /**
       * Leave room explicitly
       */
      socket.emit('chat:leave', { chatId });
    };
  }, [
    chatId,
    onNewMessage,
    onMessageDeleted,
    onTyping,
  ]);
}
