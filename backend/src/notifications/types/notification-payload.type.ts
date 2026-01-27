// backend/src/notifications/types/notification-payload.type.ts

import {
  ModerationActionType,
  ModerationTargetType,
  AppealStatus,
} from '@prisma/client';

type AppealResolvedDecision =
  Extract<AppealStatus, 'APPROVED' | 'REJECTED'>;

export type NotificationPayloadMap = {
  comment: {
    postId: string;
  };

  like: {
    postId: string;
  };

  follow: {};

  follow_request_approved: {};
  
  follow_request: {
    requesterId: string;
  };

  chat: {
    chatId: string;
    messageId: string;
  };

  chat_message: {
    chatId: string;
    messageId: string;
  };

  comment_mention: {
    postId: string;
    commentId: string;
  };

  appeal_resolved: {
  appealId: string;
  decision: AppealResolvedDecision;
};


  moderation_action: {
    actionType: ModerationActionType;
    targetType: ModerationTargetType;
    targetId: string;
    reason?: string;
  };

  feed_new_post: {
    postId: string;
    authorId: string;
  };

  feed_repost: {
    postId: string;
    actorUserId: string;
  };

  feed_mention_in_post: {
    postId: string;
  };

   post_tagged_auto_accepted: {
    postId: string;
  };

  post_tagged_request: {
    postId: string;
  };

  // (optional future)
  post_tagged_rejected: {
    postId: string;
  };
  
  post_tagged_accepted: {
    postId: string;
  };

};
