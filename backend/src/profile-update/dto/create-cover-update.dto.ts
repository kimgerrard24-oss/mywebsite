// backend/src/profile-update/dto/create-cover-update.dto.ts

import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';
import { PostVisibility } from '@prisma/client';

export class CreateCoverUpdateDto {
  @IsUUID()
  mediaId!: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;
}
