// backend/src/auth/dto/register.dto.ts

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class RegisterDto {
  // =====================
  // Email
  // =====================
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email!: string;

  // =====================
  // Username
  // =====================
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(6, { message: 'Username must be at least 6 characters' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  @Matches(/^[a-z0-9]+$/, {
    message: 'Username may contain only lowercase letters and numbers',
  })
  username!: string;

  // =====================
  // Display Name (new)
  // =====================
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Display name is required' })
  @MinLength(2, { message: 'Display name must be at least 2 characters' })
  @MaxLength(50, { message: 'Display name must not exceed 50 characters' })
  displayName!: string;

  // =====================
  // Password
  // =====================
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  // =====================
  // Country Code (ISO-2) (new, optional)
  // =====================
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'Country code must be ISO-2 format (e.g. TH, US, JP)',
  })
  countryCode?: string;

  // =====================
  // Date of Birth (new, optional)
  // =====================
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Date of birth must be a valid date' })
  dateOfBirth?: Date;

  // =====================
  // Turnstile (existing)
  // =====================
  @IsOptional()
  @IsString()
  turnstileToken?: string;
}

