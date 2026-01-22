// backend/src/admin/moderation/dto/create-moderation-action.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Validate,
} from 'class-validator';
import {
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';
import { IsValidOverrideVisibility } from '../validators/is-valid-override-visibility.validator';

export class CreateModerationActionDto {
  @IsEnum(ModerationActionType)
  @Validate(IsValidOverrideVisibility)
  actionType!: ModerationActionType;

  @IsEnum(ModerationTargetType)
  targetType!: ModerationTargetType;

  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

