/**
 * MUST mirror Prisma enum exactly
 * Backend is the sole authority
 */

export type ModerationActionType =
  | "HIDE"
  | "UNHIDE"
  | "DELETE"
  | "BAN_USER"
  | "WARN"
  | "NO_ACTION";

export type ModerationTargetType =
  | "USER"
  | "POST"
  | "COMMENT"
  | "CHAT_MESSAGE";

/**
 * Payload for POST /admin/moderation/actions
 */
export type CreateModerationActionInput = {
  actionType: ModerationActionType;
  targetType: ModerationTargetType;
  targetId: string;
  reason: string;
};

/**
 * Response DTO from backend
 */
export type ModerationActionResult = {
  id: string;
  actionType: ModerationActionType;
  targetType: ModerationTargetType;
  targetId: string;
  reason: string;
  createdAt: string;
};
