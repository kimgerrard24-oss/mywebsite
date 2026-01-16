// backend/src/auth/dto/resend-verification.dto.ts

import { IsOptional } from 'class-validator';

/**
 * Resend email verification
 *
 * IMPORTANT:
 * - No body fields allowed
 * - Target user is resolved from authenticated session only
 * - Prevents email enumeration & abuse
 */
export class ResendVerificationDto {
  /**
   * Intentionally empty DTO.
   * Validation pipe will still reject unexpected fields
   * if forbidNonWhitelisted is enabled globally.
   */
  @IsOptional()
  _?: never;
}
