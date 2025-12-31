// backend/src/notifications/types/notification-payload.type.ts

/**
 * NotificationPayloadMap
 *
 * - ใช้กำหนด payload ตาม notification type
 * - รองรับ backward compatibility (legacy types)
 * - Frontend / UX ควรใช้ type ใหม่ (canonical)
 *
 * Canonical types:
 * - comment
 * - like
 * - follow
 * - chat
 *
 * Legacy types (ยังรองรับ):
 * - chat_message
 */
export type NotificationPayloadMap = {
  /**
   * Someone commented on a post
   */
  comment: {
    postId: string;
  };

  /**
   * Someone liked a post
   */
  like: {
    postId: string;
  };

  /**
   * Someone followed a user
   */
  follow: {};

  /**
   * New chat message (canonical)
   * - ใช้สำหรับ notification UX / routing
   */
  chat: {
    chatId: string;
    messageId: string;
  };

  /**
   * Legacy chat message notification
   * - backward compatibility
   * - payload shape เหมือน chat
   */
  chat_message: {
    chatId: string;
    messageId: string;
  };
};
