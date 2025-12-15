// backend/src/users/avatar/user-avatar.policy.ts
/**
 * User Avatar Policy
 *
 * รวม business rule + security rule
 * สำหรับการเปลี่ยน avatar เท่านั้น
 */
export class UserAvatarPolicy {
  /**
   * ตรวจสอบว่าผู้ใช้สามารถเปลี่ยน avatar ได้หรือไม่
   *
   * @throws Error เมื่อไม่ผ่าน policy
   */
  static assertCanUpdateAvatar(params: {
    isDisabled: boolean;
    isActive: boolean;
  }): void {
    const { isDisabled, isActive } = params;

    if (isDisabled) {
      throw new Error('Account is disabled');
    }

    if (!isActive) {
      throw new Error('Account is not active');
    }
  }

  /**
   * Validate avatar upload file metadata
   * (เป็น layer เสริมจาก multer + pipe)
   */
  static assertValidAvatarFile(file: {
    size: number;
  }): void {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    if (file.size > MAX_SIZE) {
      throw new Error('Avatar file is too large');
    }
  }
}
