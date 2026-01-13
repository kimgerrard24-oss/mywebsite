// backend/src/securities/dto/account-lock.dto.ts

import { IsString, Length } from 'class-validator';

export class AccountLockDto {
  /** token จาก verify-credential (SENSITIVE_ACTION) */
  @IsString()
  @Length(32, 256)
  credentialToken!: string;
}
