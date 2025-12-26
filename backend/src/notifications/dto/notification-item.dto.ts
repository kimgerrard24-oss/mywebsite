// backend/src/notifications/dto/notification-item.dto.ts
export class NotificationItemDto {
  id!: string;
  type!: string;

  actor!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;

  entityId!: string | null;
  createdAt!: string;
  isRead!: boolean;
}

