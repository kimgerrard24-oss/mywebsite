// backend/src/users/dto/confirm-phone-change.dto.ts

import { IsString, Length, Matches } from 'class-validator';

export class ConfirmPhoneChangeDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]+$/, { message: 'Invalid token format' })
  token!: string;
}

