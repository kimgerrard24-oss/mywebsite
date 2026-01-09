// backend/src/notifications/dto/notification-item.dto.ts

/**
 * Backend Notification DTO
 * Backend is authority for type + payload shape
 */
export class NotificationItemDto {
  id!: string;

  /**
   * Notification type
   * - social: comment, like, follow, chat_message, comment_mention
   * - moderation: moderation_action
   * - appeal: appeal_resolved
   */
  type!:
    | 'comment'
    | 'comment_mention'
    | 'like'
    | 'follow'
    | 'chat_message'
    | 'moderation_action'
    | 'appeal_resolved'
    | string; // ✅ backward-compatible if new types added later

  actor!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;

    /**
     * Block relation snapshot (UX guard only)
     */
    isBlocked: boolean;
    hasBlockedViewer: boolean;
  } | null; // system / admin notifications may be null

  entityId!: string | null;

  /**
   * Context payload (type-specific)
   *
   * Examples:
   * - comment_mention: { postId, commentId }
   * - moderation_action: { actionType, targetType, targetId, reason? }
   * - appeal_resolved: { appealId, decision }
   */
  payload?:
    | {
        // ===== social =====
        postId?: string;
        commentId?: string;
        replyId?: string;

        // ===== moderation =====
        actionType?: string;
        targetType?: string;
        targetId?: string;
        reason?: string;

        // ===== appeal =====
        appealId?: string;
        decision?: 'APPROVED' | 'REJECTED';

        // ===== future-proof =====
        [key: string]: any;
      }
    | null;

  createdAt!: string;
  isRead!: boolean;
}
