// backend/src/admin/moderation/dto/create-moderation-action.dto.ts

import {
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import {
  ModerationActionType,
  ModerationTargetType,
} from '../constants/moderation.constants';

export class CreateModerationActionDto {
  @IsIn(['BAN', 'HIDE', 'FLAG'])
  actionType!: ModerationActionType;

  @IsIn(['USER', 'POST', 'COMMENT'])
  targetType!: ModerationTargetType;

  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

