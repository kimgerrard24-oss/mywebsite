// backend/src/users/avatar/user-avatar.policy.ts

/**
 * User Avatar Policy
 *
 * Business + Security rules
 * สำหรับการเปลี่ยน avatar เท่านั้น
 *
 * ❗ ไม่ผูกกับ HTTP / NestJS
 * ❗ ไม่ throw HttpException
 */

/**
 * Policy error สำหรับ avatar
 */
export class UserAvatarPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserAvatarPolicyError';
  }
}

export class UserAvatarPolicy {
  /**
   * ตรวจสอบว่าผู้ใช้สามารถเปลี่ยน avatar ได้หรือไม่
   *
   * Business rules:
   * - account ต้อง active
   * - account ต้องไม่ถูก disable
   */
  static assertCanUpdateAvatar(params: {
    isDisabled: boolean;
    isActive: boolean;
  }): void {
    const { isDisabled, isActive } = params;

    if (isDisabled) {
      throw new UserAvatarPolicyError('Account is disabled');
    }

    if (!isActive) {
      throw new UserAvatarPolicyError('Account is not active');
    }
  }

  /**
   * Validate avatar upload file metadata
   *
   * IMPORTANT:
   * - เป็น "policy layer" (business limit)
   * - ไม่ใช่ transport limit (multer)
   * - ใช้ซ้ำได้ใน future (mobile / worker / batch)
   */
  static assertValidAvatarFile(file: {
    size: number;
  }): void {
    /**
     * Avatar max size (raw upload)
     *
     * Rationale:
     * - Mobile photos often 3–6MB
     * - Screenshots can exceed 2MB
     * - Sharp will resize & compress later
     *
     * 8MB = Social Media standard
     */
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB

    if (!file || typeof file.size !== 'number') {
      throw new UserAvatarPolicyError('Invalid avatar file');
    }

    if (file.size <= 0) {
      throw new UserAvatarPolicyError('Invalid avatar file');
    }

    if (file.size > MAX_SIZE) {
      throw new UserAvatarPolicyError(
        'Avatar file is too large (max 8MB)',
      );
    }
  }
}

