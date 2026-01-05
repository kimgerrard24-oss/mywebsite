// backend/src/admin/actions/dto/get-admin-actions.query.dto.ts

import {
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetAdminActionsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;

  @IsOptional()
  @IsIn(['BAN', 'HIDE', 'FLAG'])
  actionType?: string;

  @IsOptional()
  @IsIn(['USER', 'POST', 'COMMENT'])
  targetType?: string;
}
