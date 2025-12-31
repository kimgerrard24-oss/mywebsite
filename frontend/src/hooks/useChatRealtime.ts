// frontend/src/hooks/useChatRealtime.ts

import { useEffect, useCallback } from 'react';
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

  onTyping?: (payload: TypingPayload) => void;
};

export function useChatRealtime({
  chatId,
  onNewMessage,
  onMessageDeleted,
  onTyping,
}: Params) {
  const joinChat = useCallback(() => {
    if (!chatId) return;

    const socket = getSocket();

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

        if (onTyping) {
          socket.off('chat:typing', onTyping);
          socket.on('chat:typing', onTyping);
        }

        console.log('Joined chat room', chatId);
      },
    );
  }, [
    chatId,
    onNewMessage,
    onMessageDeleted,
    onTyping,
  ]);

  useEffect(() => {
    if (!chatId) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', joinChat);

    if (socket.connected) {
      joinChat();
    }

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

      socket.emit('chat:leave', { chatId });
    };
  }, [
    chatId,
    joinChat,
    onNewMessage,
    onMessageDeleted,
    onTyping,
  ]);
}
