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

type Params = {
  chatId: string;
  onNewMessage: (payload: NewMessagePayload) => void;
  onMessageDeleted?: (
    payload: MessageDeletedPayload,
  ) => void;
};

export function useChatRealtime({
  chatId,
  onNewMessage,
  onMessageDeleted,
}: Params) {
  useEffect(() => {
    const socket = getSocket();

    /**
     * Join chat room
     * Must be executed whenever socket is connected
     */
    const joinChat = () => {
      socket.emit('chat:join', { chatId });
    };

    /**
     * Ensure socket is connected
     */
    if (!socket.connected) {
      socket.connect();
    }

    /**
     * IMPORTANT:
     * - join immediately if already connected
     * - join again on every reconnect
     */
    if (socket.connected) {
      joinChat();
    }

    socket.on('connect', joinChat);

    /**
     * Listen realtime events
     */
    socket.on('chat:new-message', onNewMessage);

    if (onMessageDeleted) {
      socket.on(
        'chat:message-deleted',
        onMessageDeleted,
      );
    }

    return () => {
      /**
       * Cleanup listeners
       */
      socket.off('connect', joinChat);
      socket.off('chat:new-message', onNewMessage);

      if (onMessageDeleted) {
        socket.off(
          'chat:message-deleted',
          onMessageDeleted,
        );
      }

      /**
       * Leave room explicitly
       */
      socket.emit('chat:leave', { chatId });
    };
  }, [chatId, onNewMessage, onMessageDeleted]);
}
