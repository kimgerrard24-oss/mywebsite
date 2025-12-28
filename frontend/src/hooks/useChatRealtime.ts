// frontend/src/hooks/useChatRealtime.ts

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import type { ChatMessage } from '@/types/chat-message';

type NewMessagePayload = {
  chatId: string;
  message: ChatMessage;
};

type Params = {
  chatId: string;
  onNewMessage: (payload: NewMessagePayload) => void;
};

export function useChatRealtime({ chatId, onNewMessage }: Params) {
  useEffect(() => {
    const socket = getSocket();

    const joinChat = () => {
      socket.emit(
        'chat:join',
        { chatId },
        (ack: { joined?: boolean }) => {
          // optional: ใช้ debug ได้ แต่ไม่จำเป็นต้องทำอะไร
          if (ack?.joined) {
            // joined successfully
          }
        },
      );
    };

    // ensure socket connected
    if (!socket.connected) {
      socket.connect();
    }

    // join หลัง connect เสมอ
    socket.once('connect', joinChat);

    // กรณี connect อยู่แล้ว (เช่น route change)
    if (socket.connected) {
      joinChat();
    }

    // listen realtime message
    socket.on('chat:new-message', onNewMessage);

    return () => {
      socket.off('chat:new-message', onNewMessage);
      socket.off('connect', joinChat);
      socket.emit('chat:leave', { chatId });
    };
  }, [chatId, onNewMessage]);
}
