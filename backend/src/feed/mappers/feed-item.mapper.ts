// backend/src/feed/mappers/feed-item.mapper.ts

import { FeedItemDto } from '../dto/feed-item.dto';
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

export class FeedItemMapper {
  static toDto(row: any): FeedItemDto {
    return {
      id: row.id,
      content: row.content,
      createdAt: row.publishedAt.toISOString(),

      likeCount: row.likeCount,
      commentCount: row.commentCount,

      author: {
        id: row.author.id,
        displayName: row.author.displayName,
avatarUrl: row.author.avatarMedia
  ? buildCdnUrl(row.author.avatarMedia.objectKey)
  : null,
        isPrivate: row.author.isPrivate,
        isFollowing: Array.isArray(row.author.followers) && row.author.followers.length > 0,
        isFollowRequested:
          Array.isArray(row.author.followRequestsReceived) &&
          row.author.followRequestsReceived.length > 0,
        isBlocked:
          Array.isArray(row.author.blockedBy) &&
          row.author.blockedBy.length > 0,
      },

      media: row.media.map((m: any) => ({
        id: m.media.id,
        mediaType: m.media.mediaType,
        objectKey: m.media.objectKey,
        width: m.media.width,
        height: m.media.height,
        duration: m.media.duration,
      })),
    };
  }
}
