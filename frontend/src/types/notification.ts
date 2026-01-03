// frontend/src/types/notification.ts

export type NotificationItem = {
  id: string;
  type: 'comment' | 'comment_mention' | 'like' | 'follow' | 'chat_message'

  actor: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;

  entityId: string | null;
  createdAt: string;
  isRead: boolean;

  payload?: {
    postId?: string;
  };
};


export type NotificationResponse = {
  items: NotificationItem[];
  nextCursor: string | null;
};
