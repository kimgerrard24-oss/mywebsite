// backend/src/admin/moderation/dto/override-post-visibility.dto.ts

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PostVisibility } from '@prisma/client';

export class OverridePostVisibilityDto {
  @IsEnum(['PUBLIC', 'PRIVATE'])
  visibility!: PostVisibility;

  @IsOptional()
  @IsString()
  reason?: string;
}
