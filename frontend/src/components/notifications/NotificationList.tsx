// frontend/src/components/notifications/NotificationList.tsx
import { useState } from 'react';
import NotificationItem from './NotificationItem';
import type { NotificationItem as Item } from '@/types/notification';
import { useNotificationReadAll } from '@/hooks/useNotificationReadAll';

type Props = {
  items: Item[];
};

export default function NotificationList({ items }: Props) {
  /**
   * 🔹 state ภายใน (opt-in)
   * - ถ้าไม่ใช้ read-all → render เหมือนเดิม
   */
  const [localItems, setLocalItems] = useState(items);

  /**
   * 🔹 hook ใหม่ (backend = authority)
   */
  const { markAllRead, loading } = useNotificationReadAll();

  /**
   * 🔹 handler ใหม่ (ไม่กระทบ behavior เดิม)
   */
  async function handleReadAll() {
    // optimistic UI
    setLocalItems((prev) =>
      prev.map((n) => ({ ...n, isRead: true })),
    );

    try {
      await markAllRead();
    } catch {
      // rollback (fail-soft)
      setLocalItems(items);
    }
  }

  /**
   * 🔹 behavior เดิม 100%
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
      {/* 🔹 ส่วนหัว (เพิ่มแบบไม่กระทบเดิม) */}
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

      {/* 🔹 list เดิม */}
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
