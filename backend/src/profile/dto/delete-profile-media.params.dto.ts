// backend/src/profile/dto/delete-profile-media.params.dto.ts

import { IsUUID } from 'class-validator';

export class DeleteProfileMediaParamsDto {
  @IsUUID()
  mediaId!: string;
}
