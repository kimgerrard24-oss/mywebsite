// backend/src/users/privacy/dto/update-privacy.dto.ts

import { IsBoolean } from 'class-validator';

export class UpdatePrivacyDto {
  @IsBoolean()
  isPrivate!: boolean;
}
