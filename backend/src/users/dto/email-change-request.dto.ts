// backend/src/users/dto/email-change-request.dto.ts

import { IsEmail, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class EmailChangeRequestDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsEmail()
  @MaxLength(254)
  newEmail!: string;
}
