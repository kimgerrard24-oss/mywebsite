// backend/src/admin/appeals/dto/admin-get-appeals.query.dto.ts

import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AppealStatus, AppealTargetType } from '@prisma/client';

export class AdminGetAppealsQueryDto {
  @IsOptional()
  @IsEnum(AppealStatus)
  status?: AppealStatus;

  @IsOptional()
  @IsEnum(AppealTargetType)
  targetType?: AppealTargetType;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}