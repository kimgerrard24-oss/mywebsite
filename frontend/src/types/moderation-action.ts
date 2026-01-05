// frontend/src/types/moderation-action.ts

export type ModerationActionType =
  | "BAN"
  | "HIDE"
  | "FLAG";

export type ModerationTargetType =
  | "USER"
  | "POST"
  | "COMMENT";

export type CreateModerationActionInput = {
  actionType: ModerationActionType;
  targetType: ModerationTargetType;
  targetId: string;
  reason: string;
};

export type ModerationActionResult = {
  id: string;
  actionType: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
};
