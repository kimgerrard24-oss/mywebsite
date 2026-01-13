// backend/src/admin/dto/admin-update-identity.dto.ts

import {
  IsOptional,
  IsString,
  IsEmail,
  Length,
} from 'class-validator';

export class AdminUpdateIdentityDto {
  @IsOptional()
  @IsString()
  @Length(3, 30)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsString()
  reason!: string; // mandatory for audit
}

