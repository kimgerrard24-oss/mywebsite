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

  /**
   * optional: realtime delete message
   */
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

    const joinChat = () => {
      socket.emit(
        'chat:join',
        { chatId },
        (ack: { joined?: boolean }) => {
          // optional: debug only
        },
      );
    };

    // ensure socket connected
    if (!socket.connected) {
      socket.connect();
    }

    // join after connect
    socket.once('connect', joinChat);

    // already connected (e.g. route change)
    if (socket.connected) {
      joinChat();
    }

    // listen new message
    socket.on('chat:new-message', onNewMessage);

    // listen delete message (optional)
    if (onMessageDeleted) {
      socket.on(
        'chat:message-deleted',
        onMessageDeleted,
      );
    }

    return () => {
      socket.off('chat:new-message', onNewMessage);

      if (onMessageDeleted) {
        socket.off(
          'chat:message-deleted',
          onMessageDeleted,
        );
      }

      socket.off('connect', joinChat);
      socket.emit('chat:leave', { chatId });
    };
  }, [
    chatId,
    onNewMessage,
    onMessageDeleted,
  ]);
}

