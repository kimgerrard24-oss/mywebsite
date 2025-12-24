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
      items: items.map((row) => ({
        userId: row.following.id,
        displayName: row.following.displayName ?? null,
        avatarUrl: row.following.avatarUrl ?? null,
        followedAt: row.createdAt.toISOString(),
      })),
      nextCursor: hasNext
        ? items[items.length - 1].following.id
        : null,
    };
  }
}
