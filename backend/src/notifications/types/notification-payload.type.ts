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
};
