// backend/src/admin/report/dto/get-admin-reports.query.dto.ts

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import {
  ReportStatus,
  ReportTargetType,
} from '@prisma/client';

export class GetAdminReportsQueryDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsEnum(ReportTargetType)
  targetType?: ReportTargetType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}
