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
      },

      media: Array.isArray(row.media)
        ? row.media.map((pm: any) => ({
            id: pm.media.id,
            type:
              pm.media.mediaType === MediaType.IMAGE
                ? 'image'
                : 'video',

            // ✅ การทำงานใหม่: build CDN url ให้ frontend render ได้
            url: buildCdnUrl(pm.media.objectKey),

            // ❗ เก็บไว้เพื่อ internal / future use
            objectKey: pm.media.objectKey,
          }))
        : [],

      // 🔒 logic เดิม (ไม่แตะ)
      stats: {
        likeCount: row.likeCount,
        commentCount: row.commentCount,
      },

      // 🔒 logic เดิม (authority จาก session)
      canDelete:
        !!viewerUserId &&
        !!author &&
        viewerUserId === author.id,
    };
  }
}
