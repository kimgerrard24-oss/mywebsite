export class PublicUserProfileDto {
  id!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  bio!: string | null;
  createdAt!: Date;

  /**
   * viewer === owner (ใช้ฝั่ง frontend)
   * ไม่เกี่ยวกับ permission
   */
  isSelf!: boolean;
}
