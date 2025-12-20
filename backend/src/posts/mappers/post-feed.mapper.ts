// backend/src/posts/mappers/post-feed.mapper.ts
import { PostFeedItemDto } from '../dto/post-feed-item.dto';
import { MediaType } from '@prisma/client';

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

      // ✅ FIX: ส่ง media ออกไปให้ frontend
      media: Array.isArray(row.media)
        ? row.media.map((pm: any) => ({
            id: pm.media.id,
            type:
              pm.media.mediaType === MediaType.IMAGE
                ? 'image'
                : 'video',
            // ❗️ยังไม่ build cdnUrl ที่นี่ (จะทำใน service layer)
            objectKey: pm.media.objectKey,
          }))
        : [],

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
