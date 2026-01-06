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
 * ⚠️ IMPORTANT:
 * - This DTO must ONLY use ModerationTargetType
 * - Never use ReportTargetType here
 */
export class CreateModerationActionDto {
  @IsEnum(ModerationActionType)
  actionType!: ModerationActionType;

  /**
   * Moderation target (ADMIN authority)
   * Allowed: USER | POST | COMMENT
   */
  @IsEnum(ModerationTargetType)
  targetType!: ModerationTargetType;

  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
