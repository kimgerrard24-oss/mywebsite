// backend/src/profile-update/errors/profile-update.errors.ts

import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProfileUpdateErrorCode } from './profile-update.error-codes';

export class ProfileUpdateDraftNotFoundError extends NotFoundException {
  constructor() {
    super(ProfileUpdateErrorCode.DRAFT_NOT_FOUND);
  }
}

export class ProfileUpdateAccessDeniedError extends ForbiddenException {
  constructor(code: ProfileUpdateErrorCode) {
    super(code);
  }
}
