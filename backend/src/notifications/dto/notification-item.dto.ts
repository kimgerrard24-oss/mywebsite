// backend/src/notifications/dto/notification-item.dto.ts

export class NotificationItemDto {
  id!: string;
  type!: string;

  actor!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isBlocked: boolean;
    hasBlockedViewer: boolean;
  } | null;

  entityId!: string | null;

  /**
   * Context data ของ notification
   * - comment_mention: { postId, commentId }
   * - type อื่น: optional
   */
  payload?: Record<string, any> | null; // 👈 เพิ่มบรรทัดนี้

  createdAt!: string;
  isRead!: boolean;
}
