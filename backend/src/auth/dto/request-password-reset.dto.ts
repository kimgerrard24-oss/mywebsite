// src/auth/dto/request-password-reset.dto.ts

import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
