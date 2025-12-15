// frontend/src/lib/upload/avatar-upload.ts

export function validateAvatarFile(file: File) {
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB

  if (!file) {
    throw new Error('No file selected');
  }

  if (file.size <= 0) {
    throw new Error('Invalid file');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Avatar must be smaller than 2MB');
  }

  /**
   * NOTE:
   * - ใช้เป็น UX guard เท่านั้น
   * - ไม่ reject HEIC / HEIF / unknown mimetype
   * - backend จะ validate magic bytes อีกครั้ง
   */
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }
}
