// backend/src/profile-update/dto/publish-cover-update.dto.ts

import { IsOptional, IsBoolean } from 'class-validator';

export class PublishCoverUpdateDto {
  @IsOptional()
  @IsBoolean()
  notifyFollowers?: boolean;
}

