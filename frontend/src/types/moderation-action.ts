/**
 * MUST mirror Prisma enum exactly
 * Backend is the sole authority
 */

export type ModerationActionType =
  | "HIDE"
  | "UNHIDE"
  | "DELETE"
  | "BAN_USER"
  | "WARN";

/**
 * (optional) for UI only — not sent to backend
 */
export type ModerationDecisionType =
  | ModerationActionType
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
  actionType: ModerationActionType; // ✅ only valid actions
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

