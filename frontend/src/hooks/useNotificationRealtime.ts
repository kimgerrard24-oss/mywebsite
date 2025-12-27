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

export function useNotificationRealtime() {
  const pushNotification =
    useNotificationStore(
      (s) => s.pushNotification,
    );

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const handler = (
      payload: NotificationNewPayload,
    ) => {
      pushNotification(payload.notification);
    };

    socket.on('notification:new', handler);

    return () => {
      socket.off('notification:new', handler);
    };
  }, [pushNotification]);
}
