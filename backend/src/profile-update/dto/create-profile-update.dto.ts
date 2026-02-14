// backend/src/profile-update/dto/create-profile-update.dto.ts

import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ProfileMediaType, PostVisibility } from '@prisma/client';

export class CreateProfileUpdateDto {
  @IsUUID()
  mediaId!: string;

  @IsEnum(ProfileMediaType)
  type!: ProfileMediaType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  content?: string;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;
}
