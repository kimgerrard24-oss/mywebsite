// backend/src/profile-update/dto/publish-profile-update.dto.ts

import { IsEnum } from 'class-validator';
import { ProfileMediaType } from '@prisma/client';

export class PublishProfileUpdateDto {
  @IsEnum(ProfileMediaType)
  type!: ProfileMediaType;
}

