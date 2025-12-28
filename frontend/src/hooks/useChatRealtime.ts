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

          socket.off('chat:new-message', onNewMessage);
          socket.on('chat:new-message', onNewMessage);

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

      /**
       * Leave room explicitly
       */
      socket.emit('chat:leave', { chatId });
    };
  }, [chatId, onNewMessage, onMessageDeleted]);
}
