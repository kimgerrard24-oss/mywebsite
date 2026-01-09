// backend/src/appeals/dto/create-appeal.dto.ts

import { IsEnum, IsOptional, IsString, Length, IsUUID } from 'class-validator';
import { AppealTargetType } from '@prisma/client';

export class CreateAppealDto {
  @IsEnum(AppealTargetType)
  targetType!: AppealTargetType;

  @IsUUID()
  targetId!: string;

  @IsString()
  @Length(3, 500)
  reason!: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  detail?: string;
}
