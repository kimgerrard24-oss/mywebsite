// backend/src/profile-media/dto/profile-media.response.dto.ts

import { ProfileMediaType } from "@prisma/client";

export interface ProfileMediaItemDto {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  type: ProfileMediaType;
  createdAt: Date;
}

export interface ProfileMediaResponseDto {
  items: ProfileMediaItemDto[];
  nextCursor: string | null;
}
