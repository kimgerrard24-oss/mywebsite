// backend/src/posts/mappers/post-feed.mapper.ts
import { PostFeedItemDto } from '../dto/post-feed-item.dto';

export class PostFeedMapper {
  static toDto(row: any): PostFeedItemDto {
    return {
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),

      author: {
        id: row.author.id,
        displayName: row.author.displayName,
        avatarUrl: row.author.avatarUrl,
      },

      // ✅ counter-based (ตรง schema + เร็ว + production-grade)
      stats: {
        likeCount: row.likeCount,
        commentCount: row.commentCount,
      },
    };
  }
}

