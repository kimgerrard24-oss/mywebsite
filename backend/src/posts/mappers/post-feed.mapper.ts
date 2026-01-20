// backend/src/posts/mappers/post-feed.mapper.ts
import { PostFeedItemDto } from '../dto/post-feed-item.dto';
import { MediaType } from '@prisma/client';
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

export class PostFeedMapper {
  static toDto(
    row: any,
    viewerUserId: string | null,
  ): PostFeedItemDto {
    const author = row.author ?? null;

    /**
     * =========================
     * 🔐 Owner check (viewer-aware)
     * =========================
     */
    const isOwner =
      Boolean(viewerUserId) &&
      Boolean(author) &&
      viewerUserId === author.id;

    /**
     * =========================
     * 🚨 Moderation snapshot (fail-soft)
     * =========================
     * NOTE:
     * - field อาจไม่มีในบาง query → ต้องไม่ throw
     * - authority จริงอยู่ที่ POST /appeals
     */
    const hasActiveModeration =
      row.isHidden === true ||
      row.isDeleted === true;

    return {
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),

      author: {
        id: author?.id ?? 'unknown',
        displayName: author?.displayName ?? null,
        avatarUrl: author?.avatarUrl ?? null,

        // ✅ viewer follow author?
        isFollowing:
          Array.isArray(author?.followers) &&
          author.followers.length > 0,

        isFollowRequested:
    Array.isArray(author?.followRequestsReceived) &&
    author.followRequestsReceived.length > 0,

  isBlocked:
    Array.isArray(author?.blockedBy) &&
    author.blockedBy.length > 0,

  isPrivate: author?.isPrivate === true,  
      },

      media: Array.isArray(row.media)
        ? row.media.map((pm: any) => ({
            id: pm.media.id,
            type:
              pm.media.mediaType === MediaType.IMAGE
                ? 'image'
                : 'video',
            url: buildCdnUrl(pm.media.objectKey),
            objectKey: pm.media.objectKey,
          }))
        : [],

      isSelf: isOwner,

      stats: {
        likeCount: row.likeCount,
        commentCount: row.commentCount,
      },

      canDelete: isOwner,

      /**
       * =========================
       * 📨 Appeal (UX guard only)
       * =========================
       * Backend authority อยู่ที่ POST /appeals
       */
      canAppeal: Boolean(isOwner && hasActiveModeration),
    };
  }
}
