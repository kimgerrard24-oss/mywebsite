// backend/src/notifications/mapper/notification.mapper.ts

import { NotificationItemDto } from '../dto/notification-item.dto';
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

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

    // ✅ payload must be object or null (defensive)
    const payload =
      row.payload && typeof row.payload === 'object'
        ? row.payload
        : null;

    return {
      id: row.id,
      type: row.type, // ← backend is authority

      actor: row.actor
        ? {
            id: row.actor.id,
            displayName: row.actor.displayName ?? null,
            avatarUrl: row.actor.avatarMedia
  ? buildCdnUrl(row.actor.avatarMedia.objectKey)
  : null,


            // 🔒 block snapshot (UX guard only)
            isBlocked,
            hasBlockedViewer,
          }
        : null, // ← system / admin notification allowed

      entityId: row.entityId ?? null,

      // ✅ supports:
      // - comment / like / follow
      // - moderation_action
      // - appeal_resolved
      payload,

      createdAt: row.createdAt.toISOString(),
      isRead: row.isRead,
    };
  }
}
