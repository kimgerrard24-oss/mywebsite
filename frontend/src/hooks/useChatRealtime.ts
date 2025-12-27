// frontend/src/hooks/useChatRealtime.ts

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';

type NewMessagePayload = {
  chatId: string;
  message: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  };
};

type Params = {
  chatId: string;
  onNewMessage: (payload: NewMessagePayload) => void;
};

export function useChatRealtime({ chatId, onNewMessage }: Params) {
  useEffect(() => {
    const socket = getSocket();

    // connect once
    if (!socket.connected) {
      socket.connect();
    }

    // join chat room
    socket.emit('chat:join', { chatId });

    // listen event
    socket.on('chat:new-message', onNewMessage);

    return () => {
      socket.off('chat:new-message', onNewMessage);
      socket.emit('chat:leave', { chatId });
    };
  }, [chatId, onNewMessage]);
}
