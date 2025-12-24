// backend/src/following/dto/following.response.dto.ts
export type FollowingItemDto = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  followedAt: string;
};

export type FollowingResponseDto = {
  items: FollowingItemDto[];
  nextCursor: string | null;
};
