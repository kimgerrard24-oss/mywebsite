// frontend/src/types/user-profile.ts
export interface PublicUserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  createdAt: string;
  isSelf: boolean;
  isFollowing: boolean;
  isBlocked: boolean;
  hasBlockedViewer: boolean;

  stats: {
    followers: number;
    following: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  coverUrl?: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt?: string;
  name: string | null;

    /**
   * 🔒 Block snapshot (from backend)
   * target → viewer
   */
  hasBlockedViewer: boolean;

  /**
   * follow state (only when not blocked & not self)
   */
  isFollowing: boolean;

   stats?: {
    followers: number;
    following: number;
  };
}

export interface UpdateUserPayload {
  displayName?: string;
  bio?: string;
}