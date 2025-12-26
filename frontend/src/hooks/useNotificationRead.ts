// frontend/src/hooks/useNotificationRead.ts
import { useCallback, useState } from 'react';
import { markNotificationRead } from '@/lib/api/notifications';

export function useNotificationRead() {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(
    () => new Set(),
  );

  const markRead = useCallback(async (id: string) => {
    if (loadingIds.has(id)) return;

    setLoadingIds((prev) => new Set(prev).add(id));

    try {
      await markNotificationRead(id);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [loadingIds]);

  return {
    markRead,
    isLoading: (id: string) => loadingIds.has(id),
  };
}
