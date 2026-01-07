// backend/src/following/dto/following.response.dto.ts
export type FollowingItemDto = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  followedAt: string;

  // 🔒 viewer-aware (backend authority)
  isBlocked: boolean;          // viewer blocked this user
  hasBlockedViewer: boolean;  // this user blocked viewer
};


export type FollowingResponseDto = {
  items: FollowingItemDto[];
  nextCursor: string | null;
};
