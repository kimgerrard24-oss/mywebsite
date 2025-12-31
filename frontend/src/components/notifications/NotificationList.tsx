// frontend/src/components/notifications/NotificationList.tsx

import { useEffect, useState } from 'react';
import NotificationItem from './NotificationItem';
import type { NotificationItem as Item } from '@/types/notification';
import { useNotificationReadAll } from '@/hooks/useNotificationReadAll';
import { useNotificationStore } from '@/stores/notification.store';

type Props = {
  items: Item[];
};

export default function NotificationList({ items }: Props) {
  /**
   * state ภายใน (opt-in)
   * ใช้สำหรับ optimistic UI (read-all)
   */
  const [localItems, setLocalItems] = useState(items);

  /**
   * sync เมื่อ source (props) เปลี่ยน
   */
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  /**
   * backend hook
   */
  const { markAllRead, loading } = useNotificationReadAll();

  /**
   * global store
   */
  const clearUnread =
    useNotificationStore((s) => s.clearUnread);

  /**
   * handler
   */
  async function handleReadAll() {
    // optimistic UI (local)
    setLocalItems((prev) =>
      prev.map((n) => ({ ...n, isRead: true })),
    );

    // optimistic store (global)
    clearUnread();

    try {
      await markAllRead();
    } catch {
      // rollback (fail-soft)
      setLocalItems(items);
    }
  }

  /**
   * behavior เดิม
   */
  if (localItems.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No notifications
      </p>
    );
  }

  const hasUnread = localItems.some((n) => !n.isRead);

  return (
    <section aria-label="Notification list">
      <header className="mb-2 flex items-center justify-between">
        <span className="sr-only">Notifications</span>

        {hasUnread && (
          <button
            type="button"
            onClick={handleReadAll}
            disabled={loading}
            className="
              text-xs text-blue-600
              hover:underline
              disabled:opacity-50
            "
          >
            {loading ? 'Marking…' : 'Mark all as read'}
          </button>
        )}
      </header>

      <ul className="flex flex-col gap-2">
        {localItems.map((item) => (
          <NotificationItem
            key={item.id}
            item={item}
          />
        ))}
      </ul>
    </section>
  );
}
