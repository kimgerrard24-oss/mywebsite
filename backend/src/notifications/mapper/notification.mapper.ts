// backend/src/notifications/mapper/notification.mapper.ts
import { NotificationItemDto } from '../dto/notification-item.dto';

export class NotificationMapper {
  static toDto(row: any): NotificationItemDto {
    /**
     * Block snapshot (from joined relations if provided by repository)
     *
     * Expected (optional):
     * - row.actor.blockedBy      -> viewer blocked actor
     * - row.actor.blockedUsers   -> actor blocked viewer
     *
     * Mapper MUST be fail-soft.
     * If repo does not join these relations, values will be false.
     */
    const isBlocked =
      Array.isArray(row.actor?.blockedBy) &&
      row.actor.blockedBy.length > 0;

    const hasBlockedViewer =
      Array.isArray(row.actor?.blockedUsers) &&
      row.actor.blockedUsers.length > 0;

    return {
      id: row.id,
      type: row.type,

      actor: row.actor
        ? {
            id: row.actor.id,
            displayName: row.actor.displayName ?? null,
            avatarUrl: row.actor.avatarUrl ?? null,

            // 🔒 block snapshot (UX guard only)
            isBlocked,
            hasBlockedViewer,
          }
        : null,

      entityId: row.entityId ?? null,
      payload: row.payload ?? null,
      createdAt: row.createdAt.toISOString(),
      isRead: row.isRead,
    };
  }
}

