// backend/src/profile/profile-media.validation.ts

import { MediaType } from '@prisma/client';

export function assertValidProfileMedia(media: any, actorUserId: string) {
  if (!media) {
    return 'NOT_FOUND';
  }

  if (media.ownerUserId !== actorUserId) {
    return 'NOT_OWNER';
  }

  if (media.deletedAt) {
    return 'DELETED';
  }

  if (media.mediaType !== MediaType.IMAGE) {
    return 'INVALID_TYPE';
  }

  return null;
}
