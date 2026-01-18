// backend/src/users/dto/verify-credential.dto.ts

import { IsString, MinLength, MaxLength, IsIn } from 'class-validator';

export const SENSITIVE_VERIFY_SCOPES = [
  'ACCOUNT_LOCK',
  'PROFILE_EXPORT',
] as const;

export type SensitiveVerifyScope =
  typeof SENSITIVE_VERIFY_SCOPES[number];

export class VerifyCredentialDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsIn(SENSITIVE_VERIFY_SCOPES)
  scope!: SensitiveVerifyScope;
}



