// frontend/src/types/notification.ts

export type NotificationItem = {
  id: string;
  type: 'comment' | 'like' | 'follow';

  actor: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;

  entityId: string | null;
  createdAt: string;
  isRead: boolean;
};


export type NotificationResponse = {
  items: NotificationItem[];
  nextCursor: string | null;
};
