// backend/src/follows/mappers/followers.mapper.ts
import { FollowersResponseDto } from '../dto/followers.response.dto';
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

export class FollowersMapper {
  static toResponse(
    rows: any[],
    limit: number,
  ): FollowersResponseDto {
    const hasNext = rows.length > limit;
    const items = hasNext ? rows.slice(0, limit) : rows;

    return {
      items: items.map((row) => {
        const follower = row.follower;

        return {
          userId: follower.id,
          displayName: follower.displayName ?? null,
          avatarUrl: follower.avatarMedia
  ? buildCdnUrl(follower.avatarMedia.objectKey)
  : null,

          followedAt: row.createdAt.toISOString(),

          /**
           * 🔒 Block relationship (viewer-aware)
           * UX guard only — backend still authority
           */
          isBlocked:
            Array.isArray(follower.blockedBy) &&
            follower.blockedBy.length > 0,

          hasBlockedViewer:
            Array.isArray(follower.blockedUsers) &&
            follower.blockedUsers.length > 0,
        };
      }),

      nextCursor: hasNext
        ? items[items.length - 1].follower.id
        : null,
    };
  }
}
