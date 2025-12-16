// frontend/src/types/cover.ts

export type UpdateCoverResponse = {
  success: boolean;
  coverUrl: string;

  /**
   * Optional fields (future-proofing)
   * - ไม่บังคับใช้
   * - ไม่กระทบ code ปัจจุบัน
   */
  message?: string;
};
