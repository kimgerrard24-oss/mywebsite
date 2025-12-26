// backend/src/notifications/mapper/notification.mapper.ts
import { NotificationItemDto } from '../dto/notification-item.dto';

export class NotificationMapper {
  static toDto(row: any): NotificationItemDto {
    return {
      id: row.id,
      type: row.type,
      actorUserId: row.actorUserId ?? null,
      entityId: row.entityId ?? null,
      createdAt: row.createdAt.toISOString(),
      isRead: row.isRead,
    };
  }
}
