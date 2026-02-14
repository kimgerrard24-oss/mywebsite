// backend/src/profile-update/dto/publish-profile-update.dto.ts

import { IsOptional, IsBoolean } from 'class-validator';

export class PublishProfileUpdateDto {
  @IsOptional()
  @IsBoolean()
  notifyFollowers?: boolean;
}

