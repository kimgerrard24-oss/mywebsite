// frontend/src/hooks/useNotificationRealtime.ts

import { useEffect, useRef } from 'react';
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

  const boundRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();

    const notificationHandler = (
      payload: NotificationNewPayload,
    ) => {
      if (!payload?.notification) {
        console.warn(
          '[useNotificationRealtime] invalid notification payload',
          payload,
        );
        return;
      }

      pushNotification(payload.notification);
    };

    const chatHandler = (
      payload: ChatNewMessagePayload,
    ) => {
      if (!payload?.message || !payload?.chatId) {
        console.warn(
          '[useNotificationRealtime] invalid chat notification payload',
          payload,
        );
        return;
      }

      pushNotification({
        id: `chat-${payload.message.id}`,
        type: 'chat_message',
        actor: payload.message.sender,
        entityId: payload.chatId,
        isRead: false,
        createdAt: payload.message.createdAt,
      });
    };

    const bindListeners = () => {
      if (boundRef.current) return;
      boundRef.current = true;

      socket.on('notification:new', notificationHandler);
      socket.on('chat:new-message', chatHandler);
    };

    const unbindListeners = () => {
      if (!boundRef.current) return;
      boundRef.current = false;

      socket.off('notification:new', notificationHandler);
      socket.off('chat:new-message', chatHandler);
    };

    if (socket.connected) {
      bindListeners();
    } else {
      socket.once('connect', bindListeners);
    }

    socket.io.on('reconnect', bindListeners);

    return () => {
      socket.off('connect', bindListeners);
      socket.io.off('reconnect', bindListeners);
      unbindListeners();
    };
  }, [pushNotification]);
}
