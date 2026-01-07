// backend/src/following/mapper/following.mapper.ts
import { FollowingResponseDto } from '../dto/following.response.dto';

export class FollowingMapper {
  static toResponse(
    rows: any[],
    limit: number,
  ): FollowingResponseDto {
    const hasNext = rows.length > limit;
    const items = hasNext ? rows.slice(0, limit) : rows;

    return {
      items: items.map((row) => {
        const following = row.following;

        const isBlocked =
          Array.isArray(following.blockedBy) &&
          following.blockedBy.length > 0;

        const hasBlockedViewer =
          Array.isArray(following.blockedUsers) &&
          following.blockedUsers.length > 0;

        return {
          userId: following.id,
          displayName: following.displayName ?? null,
          avatarUrl: following.avatarUrl ?? null,
          followedAt: row.createdAt.toISOString(),

          // 🔒 viewer-aware flags (UX only)
          isBlocked,
          hasBlockedViewer,
        };
      }),

      nextCursor: hasNext
        ? items[items.length - 1].following.id
        : null,
    };
  }
}
