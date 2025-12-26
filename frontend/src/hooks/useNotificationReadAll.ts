// frontend/src/hooks/useNotificationReadAll.ts
import { useCallback, useState } from 'react';
import { markAllNotificationsRead } from '@/lib/api/notifications';

export function useNotificationReadAll() {
  const [loading, setLoading] = useState(false);

  const markAllRead = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      return await markAllNotificationsRead();
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return {
    markAllRead,
    loading,
  };
}
