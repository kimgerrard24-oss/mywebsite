// file: src/auth/password-reset.exceptions.ts

import {
  BadRequestException,
  GoneException,
} from '@nestjs/common';

/**
 * Token is invalid, already used, or does not match
 */
export class PasswordResetTokenInvalidException extends BadRequestException {
  constructor() {
    super(
      'The reset link is invalid or has already been used.',
    );
  }
}

/**
 * Token is well-formed but expired
 */
export class PasswordResetTokenExpiredException extends GoneException {
  constructor() {
    super(
      'The reset link has expired. Please request a new one.',
    );
  }
}

/**
 * Client provided mismatched passwords
 * (not a security failure, but validation error)
 */
export class PasswordResetPasswordMismatchException extends BadRequestException {
  constructor() {
    super(
      'Password and confirmation do not match.',
    );
  }
}

