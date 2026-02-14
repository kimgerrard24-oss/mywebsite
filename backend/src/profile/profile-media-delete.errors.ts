// backend/src/profile/profile-media-delete.errors.ts

import { HttpException, HttpStatus } from '@nestjs/common';
import { ProfileMediaDeleteErrorCode } from './profile-media.error-codes';

export class ProfileMediaDeleteNotFoundError extends HttpException {
  constructor() {
    super(
      {
        code: ProfileMediaDeleteErrorCode.NOT_FOUND,
        message: 'Profile media not found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ProfileMediaDeleteAccessDeniedError extends HttpException {
  constructor(code: ProfileMediaDeleteErrorCode) {
    super(
      {
        code,
        message: 'Profile media delete access denied',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

