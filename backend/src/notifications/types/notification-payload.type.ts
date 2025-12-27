// backend/src/notifications/types/notification-payload.type.ts

export type NotificationPayloadMap = {
  comment: {
    postId: string;
  };
  like: {
    postId: string;
  };
  follow: {};
  chat_message: {
    chatId: string;
    messageId: string;
  };
};
