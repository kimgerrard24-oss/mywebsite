// backend/src/admin/appeals/dto/admin-resolve-appeal.dto.ts

import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AdminResolveAppealDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resolutionNote?: string;
}
