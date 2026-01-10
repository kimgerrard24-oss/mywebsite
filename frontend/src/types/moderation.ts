// frontend/src/types/moderation.ts
import type { ModerationActionType } from "@/types/moderation-action";

export type ModeratedPostDetail = {
  post: {
    id: string;
    content: string;
    isHidden: boolean;
    isDeleted: boolean;
    createdAt: string;
  };

  moderation: {
    actionType: ModerationActionType;
    reason: string;
    createdAt: string;
  } | null;

  canAppeal: boolean;
};

export type ModeratedCommentDetail = {
  comment: {
    id: string;
    postId: string;
    content: string;
    isHidden: boolean;
    isDeleted: boolean;
    createdAt: string;
  };

  moderation: {
    actionType: ModerationActionType;
    reason: string;
    createdAt: string;
  } | null;

  canAppeal: boolean;
};

export type ModeratedMessageDetail = {
  id: string;
  content: string | null;
  isDeleted: boolean;
  createdAt: string;

  moderation: {
    actionType: ModerationActionType;
    reason: string;
    createdAt: string;
  } | null;

  hasPendingAppeal: boolean;
};
