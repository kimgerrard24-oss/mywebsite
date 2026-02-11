// backend/src/profile/dto/set-avatar.dto.ts

import { IsUUID } from 'class-validator';

export class SetAvatarDto {
  @IsUUID()
  mediaId!: string;
}

