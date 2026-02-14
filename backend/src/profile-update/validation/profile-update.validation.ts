// backend/src/profile-update/validate/profile-update.validation.ts

import { BadRequestException } from '@nestjs/common';

export function validateDraftContent(content?: string) {
  if (content && content.trim().length === 0) {
    throw new BadRequestException('CONTENT_EMPTY');
  }
}
