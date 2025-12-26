// backend/src/notifications/dto/notification-item.dto.ts
export class NotificationItemDto {
  id!: string;
  type!: string;
  actorUserId!: string | null;
  entityId!: string | null;
  createdAt!: string;
  isRead!: boolean;
}
