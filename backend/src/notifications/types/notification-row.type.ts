// backend/src/notifications/types/notification-row.type.ts

/**
 * NotificationRow
 *
 * Represents a persisted notification record
 * retrieved from database layer.
 *
 * ⚠️ NOTE
 * - This type must reflect actual DB shape
 * - Keep backward-compatible with existing code
 */
export type NotificationRow = {
  /**
   * Unique notification id
   */
  id: string;

  /**
   * Notification type
   * (e.g. comment, like, follow, comment_mention)
   */
  type: string;

  /**
   * Actor user id (nullable for system events)
   */
  actorUserId: string | null;

  /**
   * Primary entity reference
   * (postId / commentId / chatId / userId)
   */
  entityId: string | null;

  /**
   * Optional structured payload
   * - Used by mention / future notification types
   * - Persisted as JSON in DB
   */
  payload: unknown | null;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Read state
   */
  isRead: boolean;
};
