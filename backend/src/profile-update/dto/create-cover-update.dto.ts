// backend/src/profile-update/dto/create-cover-update.dto.ts

import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PostVisibility } from '@prisma/client';

export class CreateCoverUpdateDto {
  @IsUUID()
  mediaId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  content?: string;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;
}

