// frontend/src/hooks/useChatRealtime.ts

import { useEffect, useCallback, useRef } from 'react';
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
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  const joinChat = useCallback(() => {
    if (!chatId) return;

    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    socket.emit('chat:join', { chatId });
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    const handleNewMessage = (payload: NewMessagePayload) => {
      onNewMessage(payload);
    };

    const handleMessageDeleted = (payload: MessageDeletedPayload) => {
      onMessageDeleted?.(payload);
    };

    const handleTyping = (payload: TypingPayload) => {
      onTyping?.(payload);
    };

    // bind listeners
    socket.on('chat:new-message', handleNewMessage);
    socket.on(
      'chat:message-deleted',
      handleMessageDeleted,
    );
    socket.on('chat:typing', handleTyping);

    const handleConnect = () => {
      joinChat();
    };

    // join after connect & reconnect
    if (socket.connected) {
      joinChat();
    } else {
      socket.once('connect', handleConnect);
    }

    socket.io.on('reconnect', joinChat);

    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.off(
        'chat:message-deleted',
        handleMessageDeleted,
      );
      socket.off('chat:typing', handleTyping);

      socket.off('connect', handleConnect);
      socket.io.off('reconnect', joinChat);

      if (socket.connected) {
        socket.emit('chat:leave', { chatId });
      }
    };
  }, [
    chatId,
    joinChat,
    onNewMessage,
    onMessageDeleted,
    onTyping,
  ]);
}
