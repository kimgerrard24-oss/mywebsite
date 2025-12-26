// backend/src/notifications/types/notification-row.type.ts
export type NotificationRow = {
  id: string;
  type: string;
  actorUserId: string | null;
  entityId: string | null;
  createdAt: Date;
  isRead: boolean;
};
