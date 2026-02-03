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

        /**
     * =========================
     * 👥 Tagged users (ACCEPTED only)
     * =========================
     */
    const taggedUsers = Array.isArray(row.userTags)
      ? row.userTags
          .filter((t: any) => t.status === 'ACCEPTED')
          .map((t: any) => ({
            id: t.taggedUser.id,
            displayName: t.taggedUser.displayName,
            username: t.taggedUser.username,
          }))
      : [];
    
    const myTag = Array.isArray(row.userTags) && viewerUserId
       ? row.userTags.find(
         (t: any) => t.taggedUserId === viewerUserId,
           )
       : null;

    const isTaggedUser = Boolean(myTag);
    const isHiddenByTaggedUser =
        Boolean(myTag?.isHiddenByTaggedUser === true);
        
    const isRepost = row.type === 'REPOST';

    return {
      type: isRepost ? 'repost' : 'post',
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),

      isTaggedUser,
      isHiddenByTaggedUser,

      author: {
        id: author?.id ?? 'unknown',
        displayName: author?.displayName ?? null,
        avatarUrl: author?.avatarUrl ?? null,

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

        originalPost: isRepost && row.originalPost
  ? {
      id: row.originalPost.id,
      content: row.originalPost.content,
      createdAt: row.originalPost.createdAt.toISOString(),
      author: {
        id: row.originalPost.author.id,
        displayName: row.originalPost.author.displayName ?? null,
        avatarUrl: row.originalPost.author.avatarUrl ?? null,
      },
      media: Array.isArray(row.originalPost.media)
        ? row.originalPost.media.map((pm: any) => ({
            id: pm.media.id,
            type:
              pm.media.mediaType === MediaType.IMAGE
                ? 'image'
                : 'video',
            url: buildCdnUrl(pm.media.objectKey),
            objectKey: pm.media.objectKey,
          }))
        : [],
    }
  : undefined,


      isSelf: isOwner,

      stats: {
        likeCount: row.likeCount,
        commentCount: row.commentCount,
        repostCount: row.repostCount ?? 0,
      },

      canDelete: isOwner,

      taggedUsers,

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
