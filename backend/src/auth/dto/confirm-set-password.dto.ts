// backend/src/auth/dto/confirm-set-password.dto.ts

import { IsString, MinLength, MaxLength } from 'class-validator';

export class ConfirmSetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
