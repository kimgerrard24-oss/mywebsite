// backend/src/users/dto/confirm-phone-change.dto.ts

import { IsString, Length } from 'class-validator';

export class ConfirmPhoneChangeDto {
  @IsString()
  @Length(6, 64)
  token!: string;
}
