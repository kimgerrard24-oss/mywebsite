// backend/src/profile-update/policy/cover-update.policy.ts

import { CoverUpdateErrorCode } from '../errors/cover-update.error-codes';
import { CoverUpdateAccessDeniedError } from '../errors/cover-update.errors';

export class CoverUpdatePolicy {
  static assertValidMedia(media: any, userId: string) {
    if (!media || media.ownerUserId !== userId) {
      throw new CoverUpdateAccessDeniedError(
        CoverUpdateErrorCode.MEDIA_NOT_OWNED,
      );
    }

    if (media.mediaCategory !== 'COVER') {
      throw new CoverUpdateAccessDeniedError(
        CoverUpdateErrorCode.INVALID_MEDIA_CATEGORY,
      );
    }
  }
}
