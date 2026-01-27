// frontend/src/types/notification.ts

export type NotificationType =
  | 'comment'
  | 'comment_mention'
  | 'like'
  | 'follow_request'
  | 'follow'
  | 'follow_request_approved'
  | 'chat_message'
  | 'moderation_action'
  | 'appeal_resolved'
  | 'post_tagged_auto_accepted'
  | 'post_tagged_request'
  | string; 
/**
 * Payload map by notification type (type-safe where known)
 */
export type NotificationPayloadMap = {
  comment: {
    postId: string;
  };

  like: {
    postId: string;
  };
  
  follow_request: {
  requesterId: string;
  };

  follow: Record<string, never>;

  follow_request_approved: Record<string, never>;

  chat_message: {
    chatId: string;
  };

  comment_mention: {
    postId: string;
    commentId: string;
  };

  moderation_action: {
    actionType: 'HIDE' | 'UNHIDE' | 'DELETE' | 'BAN_USER' | 'WARN' | string;
    targetType:
      | 'POST'
      | 'COMMENT'
      | 'USER'
      | 'CHAT_MESSAGE'
      | string;
    targetId: string;
    reason?: string;
  };

  post_tagged_auto_accepted: { postId: string };
  post_tagged_request: { postId: string };

  appeal_resolved: {
    appealId: string;
    decision: 'APPROVED' | 'REJECTED';
  };

  /**
   * fallback for unknown / future types
   */
  [key: string]: Record<string, any>;
};

/**
 * Base notification item (generic)
 * Backend is authority → frontend must be fail-soft
 */
type BaseNotificationItem<T extends NotificationType> = {
  id: string;
  type: T;

  actor: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;

    /**
     * Block relation snapshot (UX guard only)
     */
    isBlocked?: boolean;
    hasBlockedViewer?: boolean;
  } | null;

  entityId: string | null;
  createdAt: string;
  isRead: boolean;

  /**
   * Payload is optional and type depends on notification type
   * Must be optional because backend may send null
   */
  payload?: T extends keyof NotificationPayloadMap
    ? NotificationPayloadMap[T]
    : Record<string, any> | null;
};

/**
 * Discriminated union for known notification types
 */
export type NotificationItem =
  | BaseNotificationItem<'comment'>
  | BaseNotificationItem<'comment_mention'>
  | BaseNotificationItem<'like'>
  | BaseNotificationItem<'follow_request'>
  | BaseNotificationItem<'follow'>
  | BaseNotificationItem<'follow_request_approved'>
  | BaseNotificationItem<'chat_message'>
  | BaseNotificationItem<'moderation_action'>
  | BaseNotificationItem<'post_tagged_auto_accepted'>
  | BaseNotificationItem<'post_tagged_request'>
  | BaseNotificationItem<'appeal_resolved'>
  | BaseNotificationItem<string>; 

export type NotificationResponse = {
  items: NotificationItem[];
  nextCursor: string | null;
};
