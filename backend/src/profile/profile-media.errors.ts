// backend/src/profile/profile-media.errors.ts

import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProfileMediaAccessErrorCode } from './profile-media.error-codes';

/**
 * ================================
 * NOT FOUND
 * ================================
 */
export class ProfileMediaNotFoundError extends NotFoundException {
  constructor(
    message = 'Profile not found',
    code: ProfileMediaAccessErrorCode = ProfileMediaAccessErrorCode.NOT_FOUND,
  ) {
    super({
      message,
      code,
    });
  }
}

/**
 * ================================
 * ACCESS DENIED
 * ================================
 */
export class ProfileMediaAccessDeniedError extends ForbiddenException {
  constructor(
    code: ProfileMediaAccessErrorCode,
    message = 'Access denied',
  ) {
    super({
      message,
      code,
    });
  }
}
