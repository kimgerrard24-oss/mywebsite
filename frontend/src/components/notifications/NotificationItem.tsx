// frontend/src/components/notifications/NotificationItem.tsx

import type { NotificationItem as Item } from '@/types/notification';
import { useNotificationRead } from '@/hooks/useNotificationRead';
import { useRouter } from 'next/router';
import { useState, useCallback } from 'react';

type Props = {
  item: Item;
};

export default function NotificationItem({ item }: Props) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(item.isRead);
  const { markRead } = useNotificationRead();

  const resolveHref = useCallback((): string | null => {
    const type = item.type as
      | 'comment'
      | 'like'
      | 'follow'
      | 'chat';

    switch (type) {
      case 'comment':
      case 'like':
        return item.entityId
          ? `/posts/${item.entityId}`
          : null;

      case 'follow':
        return item.actor?.id
          ? `/users/${item.actor.id}`
          : null;

      case 'chat':
        return item.entityId
          ? `/chat/${item.entityId}`
          : null;

      default:
        return null;
    }
  }, [item]);

  async function handleClick() {
    if (!isRead) {
      setIsRead(true);
      try {
        await markRead(item.id);
      } catch {
        setIsRead(false);
      }
    }

    const href = resolveHref();
    if (href) {
      router.push(href);
    }
  }

  const actorName =
    item.actor?.displayName ?? 'Someone';

  const message = (() => {
    const type = item.type as
      | 'comment'
      | 'like'
      | 'follow'
      | 'chat';

    switch (type) {
      case 'comment':
        return 'commented on your post';
      case 'like':
        return 'liked your post';
      case 'follow':
        return 'started following you';
      case 'chat':
        return 'sent you a message';
      default:
        return null;
    }
  })();

  return (
    <li
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`
        flex gap-3
        rounded-md border p-3
        cursor-pointer
        transition-colors
        hover:bg-gray-50
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        ${isRead ? 'bg-gray-50' : 'bg-white'}
      `}
      aria-live="polite"
    >
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

      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm text-gray-800">
          <strong className="font-medium">
            {actorName}
          </strong>{' '}
          {message}
        </span>

        <time
          dateTime={item.createdAt}
          className="text-xs text-gray-500"
        >
          {new Date(item.createdAt).toLocaleString()}
        </time>

        {!isRead && (
          <span className="sr-only">
            Unread notification
          </span>
        )}
      </div>
    </li>
  );
}
