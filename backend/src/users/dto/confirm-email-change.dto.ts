// backend/src/users/dto/confirm-email-change.dto.ts

import { IsString, Length } from 'class-validator';

export class ConfirmEmailChangeDto {
  @IsString()
  @Length(32, 256)
  token!: string;
}
