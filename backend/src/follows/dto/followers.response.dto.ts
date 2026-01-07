// backend/src/follows/dto/followers.response.dto.ts
export type FollowerItemDto = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  followedAt: string;

  /**
   * 🔒 Block relationship (viewer-aware)
   * UX guard only — backend still authority
   */
  isBlocked?: boolean;          // viewer blocked this user
  hasBlockedViewer?: boolean;  // this user blocked viewer
};


export type FollowersResponseDto = {
  items: FollowerItemDto[];
  nextCursor: string | null;
};
