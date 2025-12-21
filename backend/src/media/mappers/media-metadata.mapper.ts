// backend/src/media/mappers/media-metadata.mapper.ts

import { MediaMetadataDto } from '../dto/media-metadata.dto';
import { MediaType } from '@prisma/client';
import { buildCdnUrl } from '../utils/build-cdn-url.util';

export class MediaMetadataMapper {
  static toDto(
    row: any,
    viewerUserId: string | null,
  ): MediaMetadataDto {
    const ownerId = row.owner?.id ?? null;

    return {
      id: row.id,

      type:
        row.mediaType === MediaType.IMAGE
          ? 'image'
          : 'video',

      url: buildCdnUrl(row.objectKey),

      objectKey: row.objectKey,

      ownerUserId: ownerId,

      postId:
        row.post && !row.post.isDeleted && !row.post.isHidden
          ? row.post.id
          : null,

      createdAt: row.createdAt.toISOString(),

      isOwner:
        !!viewerUserId &&
        !!ownerId &&
        viewerUserId === ownerId,
    };
  }
}
