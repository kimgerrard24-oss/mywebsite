// frontend/src/components/notifications/NotificationItem.tsx

import type { NotificationItem as Item } from '@/types/notification';
import { useNotificationRead } from '@/hooks/useNotificationRead';
import { useState } from 'react';

type Props = {
  item: Item;
};

export default function NotificationItem({ item }: Props) {
  const [isRead, setIsRead] = useState(item.isRead);
  const { markRead, isLoading } = useNotificationRead();

  async function handleMarkRead() {
    if (isRead) return;

    setIsRead(true);
    try {
      await markRead(item.id);
    } catch {
      setIsRead(false);
    }
  }

  const actorName =
    item.actor?.displayName ?? 'Someone';

  return (
    <li
      className={`
        flex gap-3
        rounded-md border p-3
        ${isRead ? 'bg-gray-50' : 'bg-white'}
      `}
      aria-live="polite"
    >
      {/* ===== Avatar ===== */}
      <div className="flex-shrink-0">
        {item.actor?.avatarUrl ? (
          <img
            src={item.actor.avatarUrl}
            alt={actorName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="h-8 w-8 rounded-full bg-gray-300"
            aria-hidden="true"
          />
        )}
      </div>

      {/* ===== Content ===== */}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm text-gray-800">
          <strong className="font-medium">
            {actorName}
          </strong>{' '}
          {item.type === 'comment' && 'commented on your post'}
          {item.type === 'like' && 'liked your post'}
          {item.type === 'follow' && 'started following you'}
        </span>

        <time
          dateTime={item.createdAt}
          className="text-xs text-gray-500"
        >
          {new Date(item.createdAt).toLocaleString()}
        </time>

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
            {isLoading(item.id)
              ? 'Marking...'
              : 'Mark as read'}
          </button>
        )}
      </div>
    </li>
  );
}
