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
    payload?: unknown;
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

    console.log('[useNotificationRealtime] mount', {
      socketId: socket.id,
      connected: socket.connected,
    });

    // ===== notification domain =====
    const notificationHandler = (
      payload: NotificationNewPayload,
    ) => {
      if (!payload?.notification) {
        console.warn(
          '[useNotificationRealtime] notification:new received invalid payload',
          payload,
        );
        return;
      }

      console.log(
        '[useNotificationRealtime] received notification:new',
        payload.notification,
      );

      pushNotification(payload.notification);
    };

    // ===== chat domain → notification =====
    const chatHandler = (
      payload: ChatNewMessagePayload,
    ) => {
      if (!payload?.message || !payload?.chatId) {
        console.warn(
          '[useNotificationRealtime] chat:new-message received invalid payload',
          payload,
        );
        return;
      }

      console.log(
        '[useNotificationRealtime] received chat:new-message (notification bridge)',
        {
          chatId: payload.chatId,
          messageId: payload.message.id,
          senderId: payload.message.sender?.id,
        },
      );

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

    console.log(
      '[useNotificationRealtime] listeners registered',
    );

    return () => {
      console.log('[useNotificationRealtime] cleanup', {
        socketId: socket.id,
      });

      socket.off('notification:new', notificationHandler);
      socket.off('chat:new-message', chatHandler);
    };
  }, [pushNotification]);
}
