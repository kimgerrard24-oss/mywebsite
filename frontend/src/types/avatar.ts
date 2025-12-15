// frontend/src/types/avatar.ts

export type UpdateAvatarResponse = {
  success: boolean;
  avatarUrl: string;

  /**
   * Optional fields (future-proofing)
   * - ไม่บังคับใช้
   * - ไม่กระทบ code ปัจจุบัน
   */
  message?: string;
};
