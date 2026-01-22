// backend/src/users/privacy/dto/update-post-privacy.dto.ts

import { IsBoolean } from 'class-validator';

export class UpdatePostPrivacyDto {
  @IsBoolean()
  isPrivate!: boolean;
}
