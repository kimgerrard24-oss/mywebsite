// backend/src/posts/mappers/post-feed.mapper.ts
import { PostFeedItemDto } from '../dto/post-feed-item.dto';

export class PostFeedMapper {
  static toDto(row: any): PostFeedItemDto {
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

      stats: {
        likeCount: row.likeCount,
        commentCount: row.commentCount,
      },

      canDelete: false,
    };
  }
}
