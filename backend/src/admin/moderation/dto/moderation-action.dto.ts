// backend/src/admin/moderation/dto/moderation-action.dto.ts

import {
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';

/**
 * ModerationActionDto
 *
 * Response DTO for:
 * - POST /admin/moderation/actions
 *
 * Notes:
 * - Backend is authority
 * - UNHIDE is represented by actionType === UNHIDE
 * - No canUnhide flag here by design (read-only audit concern)
 */
export class ModerationActionDto {
  id!: string;

  /**
   * HIDE | UNHIDE | BAN_USER | DELETE | WARN | NO_ACTION
   */
  actionType!: ModerationActionType;

  /**
   * USER | POST | COMMENT | CHAT_MESSAGE
   */
  targetType!: ModerationTargetType;

  targetId!: string;

  /**
   * Human-readable reason
   * (stored for audit / admin review)
   */
  reason!: string;

  createdAt!: Date;
}
