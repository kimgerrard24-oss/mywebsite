// backend/src/profile-update/errors/cover-update.errors.ts

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CoverUpdateErrorCode } from './cover-update.error-codes';

export class CoverUpdateDraftNotFoundError extends NotFoundException {
  constructor() {
    super(CoverUpdateErrorCode.DRAFT_NOT_FOUND);
  }
}

export class CoverUpdateAccessDeniedError extends ForbiddenException {
  constructor(code: CoverUpdateErrorCode) {
    super(code);
  }
}

