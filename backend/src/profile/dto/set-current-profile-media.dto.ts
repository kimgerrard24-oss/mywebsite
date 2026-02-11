// backend/src/profile/dto/set-current-profile-media.dto.ts

import { IsEnum } from 'class-validator';
import { ProfileMediaType } from '@prisma/client';

export class SetCurrentProfileMediaDto {
  @IsEnum(ProfileMediaType)
  type!: ProfileMediaType;
}
