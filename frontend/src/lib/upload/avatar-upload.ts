// frontend/src/lib/upload/avatar-upload.ts

/**
 * Client-side avatar file validation
 *
 * IMPORTANT:
 * - ใช้เพื่อ UX เท่านั้น
 * - ห้ามเชื่อถือ 100%
 * - backend จะ validate ซ้ำด้วย magic bytes + policy
 */

export function validateAvatarFile(file: File) {
  /**
   * Avatar max size (raw upload)
   *
   * Rationale:
   * - รูปจากมือถือมัก 3–6MB
   * - Screenshot / HEIC อาจใหญ่กว่านั้น
   * - backend จะ resize + compress ด้วย sharp
   *
   * Social media standard: 8MB
   */
  const MAX_SIZE = 8 * 1024 * 1024; // 8MB

  if (!file) {
    throw new Error('No file selected');
  }

  if (file.size <= 0) {
    throw new Error('Invalid file');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Avatar must be smaller than 8MB');
  }

  /**
   * UX-level mimetype check
   *
   * NOTE:
   * - ใช้แค่เตือน user
   * - ไม่ reject HEIC / HEIF / unknown mimetype
   * - backend จะตรวจ magic bytes อีกครั้ง
   */
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }
}

