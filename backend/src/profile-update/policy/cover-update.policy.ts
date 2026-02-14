// backend/src/profile-update/policy/cover-update.policy.ts

import { ForbiddenException } from '@nestjs/common';
import { ProfileMediaType } from '@prisma/client';

export class CoverUpdatePolicy {
  static assertValidMedia(context: {
    media: {
      ownerUserId: string;
      mediaCategory: ProfileMediaType | null;
    } | null;
    userId: string;
  }): void {
    const { media, userId } = context;

    if (!media || media.ownerUserId !== userId) {
      throw new ForbiddenException(
        'COVER_UPDATE_MEDIA_NOT_OWNED',
      );
    }

    if (media.mediaCategory !== ProfileMediaType.COVER) {
      throw new ForbiddenException(
        'COVER_UPDATE_INVALID_MEDIA_CATEGORY',
      );
    }
  }
}

