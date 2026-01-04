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
    if (!chatId) {
      console.warn('[useChatRealtime] joinChat skipped: no chatId');
      return;
    }

    const socket = getSocket();

    if (!socket.connected) {
      console.warn('[useChatRealtime] joinChat called but socket not connected', {
        chatId,
      });
    }

    console.log('[useChatRealtime] emit chat:join', {
      chatId,
      socketId: socket.id,
    });

    socket.emit('chat:join', { chatId });
  }, [chatId]);

  useEffect(() => {
    if (!chatId) {
      console.warn('[useChatRealtime] effect skipped: no chatId');
      return;
    }

    const socket = getSocket();

    console.log('[useChatRealtime] effect mount', {
      chatId,
      socketId: socket.id,
      connected: socket.connected,
    });

    if (!socket.connected) {
      console.warn('[useChatRealtime] socket not connected, calling connect()');
      socket.connect();
    }

    /**
     * Bind listeners FIRST (prevent race condition)
     */
    socket.off('chat:new-message', onNewMessage);
    socket.on('chat:new-message', (payload) => {
      console.log('[useChatRealtime] received chat:new-message', payload);
      onNewMessage(payload);
    });

    if (onMessageDeleted) {
      socket.off(
        'chat:message-deleted',
        onMessageDeleted,
      );
      socket.on(
        'chat:message-deleted',
        (payload) => {
          console.log(
            '[useChatRealtime] received chat:message-deleted',
            payload,
          );
          onMessageDeleted(payload);
        },
      );
    }

    if (onTyping) {
      socket.off('chat:typing', onTyping);
      socket.on('chat:typing', (payload) => {
        console.log(
          '[useChatRealtime] received chat:typing',
          payload,
        );
        onTyping(payload);
      });
    }

    /**
     * Ensure join happens after connected
     */
    if (socket.connected) {
      console.log(
        '[useChatRealtime] socket already connected, joining immediately',
      );
      joinChat();
    } else {
      console.log(
        '[useChatRealtime] waiting for socket connect to join chat',
      );
      socket.once('connect', () => {
        console.log(
          '[useChatRealtime] socket connected (once), joining chat',
          { chatId, socketId: socket.id },
        );
        joinChat();
      });
    }

    return () => {
      console.log('[useChatRealtime] cleanup', {
        chatId,
        socketId: socket.id,
      });

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

      console.log('[useChatRealtime] emit chat:leave', {
        chatId,
        socketId: socket.id,
      });

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
