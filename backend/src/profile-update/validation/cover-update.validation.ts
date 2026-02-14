// backend/src/profile-update/validation/cover-update.validation.ts

import { BadRequestException } from '@nestjs/common';

const MAX_PROFILE_UPDATE_CONTENT_LENGTH = 1000;

export function validateCoverUpdateContent(content?: string) {
  if (content === undefined || content === null) {
    return;
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    throw new BadRequestException('CONTENT_EMPTY');
  }

  if (trimmed.length > MAX_PROFILE_UPDATE_CONTENT_LENGTH) {
    throw new BadRequestException('CONTENT_TOO_LONG');
  }
}

