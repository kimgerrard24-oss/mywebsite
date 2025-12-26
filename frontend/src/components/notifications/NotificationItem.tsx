// frontend/src/components/notifications/NotificationItem.tsx

import type { NotificationItem as Item } from '@/types/notification';
import { useNotificationRead } from '@/hooks/useNotificationRead';
import { useState } from 'react';

type Props = {
  item: Item;
};

export default function NotificationItem({ item }: Props) {
  // 🔹 state เดิม (ไม่กระทบ behavior เดิม)
  const [isRead, setIsRead] = useState(item.isRead);

  // 🔹 hook ใหม่ (backend authority)
  const { markRead, isLoading } = useNotificationRead();

  async function handleMarkRead() {
    if (isRead) return;

    // optimistic UI
    setIsRead(true);

    try {
      await markRead(item.id);
    } catch {
      // rollback (fail-soft)
      setIsRead(false);
    }
  }

  return (
    <li
      className={`
        flex flex-col gap-1
        rounded-md border p-3
        ${isRead ? 'bg-gray-50' : 'bg-white'}
      `}
      aria-live="polite"
    >
      <span className="text-sm text-gray-800">
        {item.type}
      </span>

      <time
        dateTime={item.createdAt}
        className="text-xs text-gray-500"
      >
        {new Date(item.createdAt).toLocaleString()}
      </time>

      {/* 🔹 ส่วนใหม่ (ไม่กระทบของเดิม) */}
      {!isRead && (
        <button
          type="button"
          onClick={handleMarkRead}
          disabled={isLoading(item.id)}
          className="
            mt-1 self-start
            text-xs text-blue-600
            hover:underline
            disabled:opacity-50
          "
        >
          {isLoading(item.id) ? 'Marking...' : 'Mark as read'}
        </button>
      )}
    </li>
  );
}
