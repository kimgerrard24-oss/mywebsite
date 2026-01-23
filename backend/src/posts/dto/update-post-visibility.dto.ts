// backend/src/posts/dto/update-post-visibility.dto.ts

import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ArrayMaxSize,
  ValidateIf,
} from 'class-validator';
import { PostVisibility } from '@prisma/client';

export class UpdatePostVisibilityDto {
  // =========================
  // Visibility level
  // =========================
  @IsEnum(PostVisibility)
  visibility!: PostVisibility;

  // =========================
  // CUSTOM visibility rules
  // =========================

  /**
   * Only allowed when visibility === CUSTOM
   */
  @ValidateIf((o) => o.visibility === PostVisibility.CUSTOM)
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200) // production-safe cap
  @IsString({ each: true })
  includeUserIds?: string[];

  /**
   * Only allowed when visibility === CUSTOM
   */
  @ValidateIf((o) => o.visibility === PostVisibility.CUSTOM)
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  excludeUserIds?: string[];
}
