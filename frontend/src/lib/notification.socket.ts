// frontend/src/lib/notification.socket.ts

'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useNotificationStore } from '@/stores/notification.store';

export function useNotificationSocket() {
  const pushNotification = useNotificationStore(
    (s) => s.pushNotification,
  );

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) return;

    function onNewNotification(payload: any) {
      if (!payload?.id) return;
      pushNotification(payload);
    }

    socket.on('notification:new', onNewNotification);

    return () => {
      socket.off('notification:new', onNewNotification);
    };
  }, [pushNotification]);
}
