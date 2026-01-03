// backend/src/notifications/types/notification-payload.type.ts

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
   */
  chat: {
    chatId: string;
    messageId: string;
  };

  /**
   * Legacy chat message notification
   */
  chat_message: {
    chatId: string;
    messageId: string;
  };

  /**
   * Someone mentioned you in a comment
   */
  comment_mention: {
    postId: string;
    commentId: string;
  };
};

