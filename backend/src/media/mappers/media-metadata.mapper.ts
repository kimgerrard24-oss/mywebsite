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
     * 🔎 Resolve related post (authoritative source)
     * =====================================================
     */
    const relatedPost =
      row.post ??
      row.posts?.[0]?.post ??
      null;

    const hasValidPost =
      !!relatedPost &&
      relatedPost.isDeleted !== true &&
      relatedPost.isHidden !== true;

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

      /**
       * 🔹 Video thumbnail (safe, optional)
       */
      thumbnailUrl:
        row.mediaType === MediaType.VIDEO &&
        row.thumbnailObjectKey
          ? buildCdnUrl(row.thumbnailObjectKey)
          : undefined,

      ownerUserId: ownerId,

      /**
       * =====================================================
       * 🔗 Backward-compatible
       * =====================================================
       */
      postId: hasValidPost ? relatedPost.id : null,

      /**
       * =====================================================
       * 🆕 Post context (for media viewer only)
       * =====================================================
       */
      ...(hasValidPost
        ? {
            usedPost: {
              id: relatedPost.id,
              content: relatedPost.content,
              createdAt:
                relatedPost.createdAt.toISOString(),
              author: {
                id: relatedPost.author.id,
                username:
                  relatedPost.author.username,
                avatarUrl:
                  relatedPost.author.avatarUrl ??
                  null,
              },
            },
          }
        : {}),

      createdAt: row.createdAt.toISOString(),

      isOwner,

      canAppeal: Boolean(isOwner && hasActiveModeration),
    };
  }
}
