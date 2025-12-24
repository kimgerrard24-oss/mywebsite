// frontend/src/types/following.ts

export type FollowingUser = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  followedAt: string;
};
