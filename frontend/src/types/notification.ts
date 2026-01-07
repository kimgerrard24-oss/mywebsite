// frontend/src/types/notification.ts

export type NotificationItem = {
  id: string;
  type:
    | 'comment'
    | 'comment_mention'
    | 'like'
    | 'follow'
    | 'chat_message';

  actor: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;

    /**
     * Block relation snapshot (from backend)
     * frontend = UX guard only
     */
    isBlocked?: boolean;        // viewer blocked actor
    hasBlockedViewer?: boolean; // actor blocked viewer
  } | null;

  entityId: string | null;
  createdAt: string;
  isRead: boolean;

  payload?: {
    postId?: string;
    commentId?: string;
    replyId?: string;
  };
};

export type NotificationResponse = {
  items: NotificationItem[];
  nextCursor: string | null;
};
