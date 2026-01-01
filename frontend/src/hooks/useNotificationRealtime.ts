// frontend/src/hooks/useNotificationRealtime.ts

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useNotificationStore } from '@/stores/notification.store';

type NotificationNewPayload = {
  notification: {
    id: string;
    type: string;
    actor: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
    entityId: string | null;
    isRead: boolean;
    createdAt: string;
  };
};

type ChatNewMessagePayload = {
  chatId: string;
  message: {
    id: string;
    sender: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
    createdAt: string;
  };
};

export function useNotificationRealtime() {
  const pushNotification =
    useNotificationStore((s) => s.pushNotification);

  useEffect(() => {
    const socket = getSocket();

    // ===== notification domain =====
    const notificationHandler = (
      payload: NotificationNewPayload,
    ) => {
      pushNotification(payload.notification);
    };

    // ===== chat domain → notification =====
    const chatHandler = (
      payload: ChatNewMessagePayload,
    ) => {
      pushNotification({
        id: `chat-${payload.message.id}`,
        type: 'chat_message',
        actor: payload.message.sender,
        entityId: payload.chatId,
        isRead: false,
        createdAt: payload.message.createdAt,
      });
    };

    socket.on('notification:new', notificationHandler);
    socket.on('chat:new-message', chatHandler);

    return () => {
      socket.off('notification:new', notificationHandler);
      socket.off('chat:new-message', chatHandler);
    };
  }, [pushNotification]);
}
