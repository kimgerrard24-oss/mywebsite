// frontend/src/lib/upload/cover-upload.ts

/**
 * Client-side cover file validation
 *
 * IMPORTANT:
 * - ใช้เพื่อ UX เท่านั้น
 * - ห้ามเชื่อ 100%
 * - backend จะ validate ซ้ำด้วย policy + sharp
 */
export function validateCoverFile(file: File) {
  /**
   * Cover max size (raw upload)
   *
   * Rationale:
   * - Cover มักใหญ่กว่า avatar
   * - ภาพจากมือถือ 12–48MP
   * - backend จะ resize + crop
   *
   * Social media standard: 20MB
   */
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB

  if (!file) {
    throw new Error('No file selected');
  }

  if (file.size <= 0) {
    throw new Error('Invalid file');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Cover image must be smaller than 20MB');
  }

  /**
   * UX-level mimetype check
   *
   * NOTE:
   * - ใช้แค่เตือน user
   * - ไม่ reject HEIC / HEIF
   * - backend จะตรวจจริงด้วย sharp
   */
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }
}
