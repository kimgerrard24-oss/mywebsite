// backend/src/users/cover/user-cover.policy.ts
/**
 * User Cover Policy
 *
 * Business + Security rules
 * สำหรับการเปลี่ยน cover เท่านั้น
 *
 * ❗ ไม่ผูกกับ HTTP / NestJS
 * ❗ ไม่ throw HttpException
 * ❗ เป็น pure business policy
 */

/**
 * Policy error สำหรับ cover
 */
export class UserCoverPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserCoverPolicyError';
  }
}

export class UserCoverPolicy {
  /**
   * ตรวจสอบว่าผู้ใช้สามารถเปลี่ยน cover ได้หรือไม่
   *
   * Business rules:
   * - account ต้อง active
   * - account ต้องไม่ถูก disable
   */
  static assertCanUpdateCover(params: {
    isDisabled: boolean;
    isActive: boolean;
  }): void {
    const { isDisabled, isActive } = params;

    if (isDisabled) {
      throw new UserCoverPolicyError('Account is disabled');
    }

    if (!isActive) {
      throw new UserCoverPolicyError('Account is not active');
    }
  }

  /**
   * Validate cover upload file metadata
   *
   * IMPORTANT:
   * - เป็น policy layer (business limit)
   * - ไม่ใช่ transport limit (multer)
   * - ไม่ตรวจ mimetype (ทำที่ transport layer)
   */
  static assertValidCoverFile(file: {
    size: number;
  }): void {
    /**
     * Cover max size (raw upload)
     *
     * Rationale:
     * - Cover image ใหญ่กว่า avatar
     * - รองรับภาพจากมือถือความละเอียดสูง
     * - Sharp จะ resize / compress ภายหลัง
     *
     * 20MB = Social Media standard
     */
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB

    if (!file || typeof file.size !== 'number') {
      throw new UserCoverPolicyError('Invalid cover file');
    }

    if (file.size <= 0) {
      throw new UserCoverPolicyError('Invalid cover file');
    }

    if (file.size > MAX_SIZE) {
      throw new UserCoverPolicyError(
        'Cover file is too large (max 20MB)',
      );
    }
  }
}
