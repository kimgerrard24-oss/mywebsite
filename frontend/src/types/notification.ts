// frontend/src/types/notification.ts

export type NotificationItem = {
  id: string;
  type: string;
  actorUserId: string | null;
  entityId: string | null;
  createdAt: string;
  isRead: boolean;
};

export type NotificationResponse = {
  items: NotificationItem[];
  nextCursor: string | null;
};
