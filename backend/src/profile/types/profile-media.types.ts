// backend/src/profile/profile-media.types.ts

import { ProfileMediaType } from '@prisma/client';

export type SetCurrentProfileMediaParams = {
  actorUserId: string;
  mediaId: string;
  type: ProfileMediaType;
};
