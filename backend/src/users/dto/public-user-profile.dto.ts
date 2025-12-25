// backend/src/users/dto/public-user-profile.dto.ts

export class PublicUserProfileDto {
  id!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  coverUrl!: string | null;
  bio!: string | null;
  createdAt!: Date;

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
   * follower / following counts
   */
  stats!: {
    followers: number;
    following: number;
  };
}
