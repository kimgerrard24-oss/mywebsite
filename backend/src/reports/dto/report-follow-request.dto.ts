// backend/src/reports/dto/report-follow-request.dto.ts

import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ReportReason } from '@prisma/client';

export class ReportFollowRequestDto {
  @IsEnum(ReportReason)
  reason!: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
