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
   * viewer follow user นี้อยู่หรือไม่
   */
  isFollowing!: boolean;

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
   * follower / following counts
   */
  stats!: {
    followers: number;
    following: number;
  };
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

  hasBlockedViewer!: false;
  isBlocked!: false;
  isFollowing!: false;

  stats!: {
    followers: number;
    following: number;
  };

  canAppeal?: boolean;
}


