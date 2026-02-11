// backend/src/profile-media/profile-media.mapper.ts

import { Media } from '@prisma/client';
import { ProfileMediaItemDto } from '../dto/profile-media.response.dto';
import { CurrentProfileMediaItemDto } from '../dto/get-current-profile-media.response.dto';
import { R2Service } from '../../r2/r2.service';

/**
 * IMPORTANT:
 * - Single class only
 * - No duplicate exports
 * - All mapping logic centralized
 */

export class ProfileMediaMapper {
  /* =========================================================
     GRID LIST MAPPER (GET /profile-media)
  ========================================================== */

  static toDto(
    media: Media,
    r2?: R2Service,
  ): ProfileMediaItemDto {
    const buildUrl = (key: string) =>
      r2 ? r2.buildPublicUrl(key) : `${process.env.CDN_BASE_URL}/${key}`;

    return {
      id: media.id,
      url: buildUrl(media.objectKey),
      thumbnailUrl: media.thumbnailObjectKey
        ? buildUrl(media.thumbnailObjectKey)
        : null,
      type: media.profileType!,
      createdAt: media.createdAt,
    };
  }

  /* =========================================================
     CURRENT PROFILE MEDIA (avatar / cover)
  ========================================================== */

  static toCurrentDto(
    media: Media,
    r2: R2Service,
  ): CurrentProfileMediaItemDto {
    return {
      mediaId: media.id,
      url: r2.buildPublicUrl(media.objectKey),
      thumbnailUrl: media.thumbnailObjectKey
        ? r2.buildPublicUrl(media.thumbnailObjectKey)
        : null,
      width: media.width,
      height: media.height,
    };
  }

  /* =========================================================
     GENERIC PUBLIC URL BUILDER
  ========================================================== */

  static toPublicUrl(
    r2: R2Service,
    objectKey: string,
  ): string {
    return r2.buildPublicUrl(objectKey);
  }
}
