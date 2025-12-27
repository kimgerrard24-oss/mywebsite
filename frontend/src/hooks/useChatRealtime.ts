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

    // connect once (idempotent)
    if (!socket.connected) {
      socket.connect();
    }

    // backend is authority: client can only request join
    socket.emit('chat:join', { chatId });

    // listen realtime message
    socket.on('chat:new-message', onNewMessage);

    return () => {
      socket.off('chat:new-message', onNewMessage);
      socket.emit('chat:leave', { chatId });
    };
  }, [chatId, onNewMessage]);
}
