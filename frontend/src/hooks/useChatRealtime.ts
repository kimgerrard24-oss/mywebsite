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

    // ✅ join ทุกครั้งที่ socket connect / reconnect
    socket.on('connect', joinChat);

    // กรณี connect อยู่แล้ว (เช่น route change)
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

      // leave room explicitly
      socket.emit('chat:leave', { chatId });
    };
  }, [
    chatId,
    onNewMessage,
    onMessageDeleted,
  ]);
}
