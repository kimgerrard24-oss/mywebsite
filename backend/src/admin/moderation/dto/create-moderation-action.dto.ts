// backend/src/admin/moderation/dto/create-moderation-action.dto.ts

import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import {
  ModerationActionType,
  ReportTargetType,
} from '@prisma/client';

export class CreateModerationActionDto {
  @IsEnum(ModerationActionType)
  actionType!: ModerationActionType;

  @IsEnum(ReportTargetType)
  targetType!: ReportTargetType;

  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
