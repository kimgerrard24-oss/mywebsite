// backend/src/users/dto/public-user-profile.dto.ts

export class PublicUserProfileDto {
  id!: string;
  username!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  coverUrl!: string | null;
  bio!: string | null;
  createdAt!: string;

  /**
   * viewer === owner (ใช้ฝั่ง frontend)
   * ไม่เกี่ยวกับ permission
   */
  isSelf!: boolean;

  /**
   * target account privacy
   * FE ใช้ตัดสิน follow vs request
   */
  isPrivate!: boolean; // ✅ NEW

  /**
   * viewer follow user นี้อยู่หรือไม่
   */
  isFollowing!: boolean;

  
  isFollowRequested!: boolean;
  /**
   * viewer block user นี้อยู่หรือไม่
   * (ใช้ตัดสิน Block / Unblock button)
   */
  isBlocked!: boolean;

  /**
   * target block viewer หรือไม่
   * (ใช้กับ chat / follow / notif)
   */
  hasBlockedViewer?: boolean;
  

  /**
 * viewer can see full profile content
 * (posts, stats, media, etc.)
 */
  canViewContent!: boolean;

  /**
   * follower / following counts
   */
  stats!: {
    followers: number;
    following: number;
  };

  /**
   * UX guard only (backend still authority)
   */
  canAppeal?: boolean;
}

export class MeUserProfileDto {
  id!: string;

  email!: string;
  isEmailVerified!: boolean;
  username!: string;

  displayName!: string | null;
  avatarUrl!: string | null;
  coverUrl!: string | null;
  bio!: string | null;
  createdAt!: string;
  updatedAt?: string;

  isSelf!: true;

  /** me route does not use follow flow */
  isPrivate?: boolean;

  isFollowRequested?: false;

  hasBlockedViewer!: false;
  isBlocked!: false;
  isFollowing!: false;

  stats!: {
    followers: number;
    following: number;
  };

  canAppeal?: boolean;
}



