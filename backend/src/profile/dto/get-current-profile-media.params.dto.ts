// backend/src/profile/dto/get-current-profile-media.params.dto.ts

import { IsUUID } from 'class-validator';

export class GetCurrentProfileMediaParamsDto {
  @IsUUID()
  userId!: string;
}
