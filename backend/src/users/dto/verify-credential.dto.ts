// backend/src/users/dto/verify-credential.dto.ts

import { IsString, MinLength, MaxLength, IsIn } from 'class-validator';

export class VerifyCredentialDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsIn(['ACCOUNT_LOCK', 'PROFILE_EXPORT'])
  scope!: 'ACCOUNT_LOCK' | 'PROFILE_EXPORT';
}

