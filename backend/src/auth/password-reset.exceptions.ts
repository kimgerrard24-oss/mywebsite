// file: src/auth/password-reset.exceptions.ts

import { BadRequestException, GoneException } from '@nestjs/common';

export class PasswordResetTokenInvalidException extends BadRequestException {
  constructor() {
    super('The reset link is invalid or has already been used.');
  }
}

export class PasswordResetTokenExpiredException extends GoneException {
  constructor() {
    super('The reset link has expired. Please request a new one.');
  }
}

export class PasswordResetPasswordMismatchException extends BadRequestException {
  constructor() {
    super('Password and confirmation do not match.');
  }
}
