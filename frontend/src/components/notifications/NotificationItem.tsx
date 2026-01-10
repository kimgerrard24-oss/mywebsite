// frontend/src/components/notifications/NotificationItem.tsx

import type { NotificationItem as Item } from '@/types/notification';
import { useNotificationRead } from '@/hooks/useNotificationRead';
import { useRouter } from 'next/router';
import { useState, useCallback } from 'react';
import { useNotificationStore } from '@/stores/notification.store';

type Props = {
  item: Item;
};

export default function NotificationItem({ item }: Props) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(item.isRead);
  const { markRead } = useNotificationRead();
  const markAsReadInStore =
    useNotificationStore((s) => s.markAsRead);

  const isBlocked =
    item.actor?.isBlocked === true ||
    item.actor?.hasBlockedViewer === true;

  /**
   * Resolve destination URL from notification
   * frontend = routing authority
   */
  const resolveHref = useCallback((): string | null => {
    switch (item.type) {

      case 'moderation_action': {
  const { targetType, targetId } = item.payload || {};
  if (!targetType || !targetId) return null;

 if (targetType === 'POST')
  return `/moderation/posts/${targetId}`;

if (targetType === 'COMMENT')
  return `/moderation/comments/${targetId}`;

if (targetType === 'CHAT_MESSAGE')
  return `/moderation/chat-message/${targetId}`;


  return null;
}
      case 'appeal_resolved':
        return item.payload?.appealId
          ? `/appeals/${item.payload.appealId}`
          : null;

      case 'comment':
      case 'like':
        return item.entityId
          ? `/posts/${item.entityId}`
          : null;

      case 'comment_mention':
        return item.payload?.postId && item.entityId
          ? `/posts/${item.payload.postId}#comment-${item.entityId}`
          : null;

      case 'follow':
        return item.actor?.id
          ? `/users/${item.actor.id}`
          : null;

      case 'chat_message':
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
      markAsReadInStore(item.id);

      try {
        await markRead(item.id);
      } catch {
        setIsRead(false);
      }
    }

    const href = resolveHref();
    if (href && !isBlocked) {
      router.push(href);
    }
  }

  const actorName =
    item.actor?.displayName ??
    (item.type === 'moderation_action' ||
    item.type === 'appeal_resolved'
      ? 'Moderator'
      : 'Someone');

  /**
   * Resolve display message (text only)
   */
  const message = (() => {
    switch (item.type) {
      case 'comment':
        return 'commented on your post';

      case 'comment_mention':
        return 'mentioned you in a comment';

      case 'like':
        return 'liked your post';

      case 'follow':
        return 'started following you';

      case 'chat_message':
        return 'sent you a message';

      case 'moderation_action': {
        const action = item.payload?.actionType;

        switch (action) {
          case 'HIDE':
            return 'your content was hidden by moderator';
          case 'UNHIDE':
            return 'your content was restored by moderator';
          case 'DELETE':
            return 'your content was removed by moderator';
          case 'BAN_USER':
            return 'your account was restricted by moderator';
          case 'WARN':
            return 'you received a warning from moderator';
          default:
            return 'moderation action was applied';
        }
      }

      case 'appeal_resolved':
        return item.payload?.decision === 'APPROVED'
          ? 'your appeal was approved'
          : 'your appeal was rejected';

      default:
        return 'You have a new notification';
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
          {isBlocked && (
            <span className="mr-2 text-xs text-gray-400">
              ไม่สามารถโต้ตอบกับผู้ใช้นี้ได้
            </span>
          )}

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
