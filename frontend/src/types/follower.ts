// frontend/src/types/follower.ts

export type Follower = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  followedAt: string;
  isBlocked?: boolean;        // viewer block target
  hasBlockedViewer?: boolean; // target block viewer
};
