// backend/src/profile/dto/set-cover.dto.ts

import { IsUUID } from 'class-validator';

export class SetCoverDto {
  @IsUUID()
  mediaId!: string;
}
