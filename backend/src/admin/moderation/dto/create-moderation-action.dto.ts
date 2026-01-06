import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import {
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';

/**
 * DTO for creating a moderation action (ADMIN domain)
 *
 * ⚠️ IMPORTANT
 * - This DTO is for WRITE-side moderation only
 * - Backend is authority (state validation happens in service/repository)
 *
 * Supported actions (via enum):
 * - HIDE
 * - UNHIDE
 * - BAN_USER
 * - DELETE
 * - WARN
 * - NO_ACTION
 *
 * Supported targets (via enum):
 * - USER
 * - POST
 * - COMMENT
 * - CHAT_MESSAGE
 *
 * ❌ DO NOT use ReportTargetType here
 */
export class CreateModerationActionDto {
  /**
   * Moderation action type
   * (e.g. HIDE / UNHIDE / BAN_USER)
   */
  @IsEnum(ModerationActionType)
  actionType!: ModerationActionType;

  /**
   * Moderation target (ADMIN authority)
   */
  @IsEnum(ModerationTargetType)
  targetType!: ModerationTargetType;

  /**
   * Target entity ID
   */
  @IsString()
  @IsNotEmpty()
  targetId!: string;

  /**
   * Human-readable reason
   * - Required for audit trail
   * - Used in report resolution
   */
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
