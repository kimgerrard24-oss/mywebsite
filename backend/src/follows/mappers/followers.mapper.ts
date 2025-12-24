// backend/src/follows/mappers/followers.mapper.ts
import { FollowersResponseDto } from '../dto/followers.response.dto';

export class FollowersMapper {
  static toResponse(
    rows: any[],
    limit: number,
  ): FollowersResponseDto {
    const hasNext = rows.length > limit;
    const items = hasNext ? rows.slice(0, limit) : rows;

    return {
      items: items.map((row) => ({
        userId: row.follower.id,
        displayName: row.follower.displayName ?? null,
        avatarUrl: row.follower.avatarUrl ?? null,
        followedAt: row.createdAt.toISOString(),
      })),
      nextCursor: hasNext
        ? items[items.length - 1].follower.id
        : null,
    };
  }
}
