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

    /**
     * =====================================================
     * 🔎 Resolve related post (support both old & new shape)
     * =====================================================
     */
    const relatedPost =
      row.post ??
      row.posts?.[0]?.post ??
      null;

    const postId =
      relatedPost &&
      relatedPost.isDeleted !== true &&
      relatedPost.isHidden !== true
        ? relatedPost.id
        : null;

    /**
     * =====================================================
     * 🔐 Ownership
     * =====================================================
     */
    const isOwner =
      !!viewerUserId &&
      !!ownerId &&
      viewerUserId === ownerId;

    /**
     * =====================================================
     * ⚠️ Active moderation snapshot (UX only)
     * =====================================================
     * - media deleted
     * - or attached post hidden / deleted
     */
    const hasActiveModeration =
      Boolean(row.deletedAt) ||
      Boolean(
        relatedPost &&
          (relatedPost.isDeleted === true ||
            relatedPost.isHidden === true),
      );

    return {
      id: row.id,

      type:
        row.mediaType === MediaType.IMAGE
          ? 'image'
          : 'video',

      url: buildCdnUrl(row.objectKey),

      objectKey: row.objectKey,

      ownerUserId: ownerId,

      postId,

      createdAt: row.createdAt.toISOString(),

      isOwner,

      /**
       * ✅ UX guard only
       * backend authority is enforced in POST /appeals
       */
      canAppeal: Boolean(isOwner && hasActiveModeration),
    };
  }
}
