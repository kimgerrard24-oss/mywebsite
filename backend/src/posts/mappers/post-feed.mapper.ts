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

    return {
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),

      author: {
        id: author?.id ?? 'unknown',
        displayName: author?.displayName ?? null,
        avatarUrl: author?.avatarUrl ?? null,

        // ✅ FIX: อ่านจาก followers ที่ query มา
        isFollowing:
          Array.isArray(author?.followers) &&
          author.followers.length > 0,
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

      isSelf: viewerUserId === author?.id,

      stats: {
        likeCount: row.likeCount,
        commentCount: row.commentCount,
      },

      canDelete:
        !!viewerUserId &&
        !!author &&
        viewerUserId === author.id,
    };
  }
}
