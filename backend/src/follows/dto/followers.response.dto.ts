// backend/src/follows/dto/followers.response.dto.ts
export type FollowerItemDto = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  followedAt: string;
};

export type FollowersResponseDto = {
  items: FollowerItemDto[];
  nextCursor: string | null;
};
