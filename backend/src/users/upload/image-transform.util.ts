// backend/src/users/upload/image-transform.util.ts
import sharp from 'sharp';

/**
 * Transform & normalize avatar image
 *
 * - resize ให้เป็นขนาดคงที่
 * - strip metadata ทั้งหมด
 * - convert เป็น webp
 * - ป้องกัน image bomb / malformed image
 *
 * ใช้กับ avatar เท่านั้น
 */
export async function transformImage(
  input: Buffer,
): Promise<Buffer> {
  // defensive guard (utility-level)
  if (!input || !Buffer.isBuffer(input)) {
    throw new Error('Invalid image buffer');
  }

  try {
    return await sharp(input, {
      // ป้องกัน image bomb (ค่า default = 268M pixels)
      limitInputPixels: 512 * 512,
    })
      // normalize orientation จาก EXIF
      .rotate()

      // resize แบบครอบ (avatar square)
      .resize(512, 512, {
        fit: 'cover',
        withoutEnlargement: true,
      })

      // strip metadata + convert format
      .toFormat('webp', {
        quality: 85,
        effort: 4,
      })

      .toBuffer();
  } catch (error) {
    // อย่า throw HttpException ที่ utility layer
    // ให้ service layer เป็นคน map error
    throw error instanceof Error
      ? error
      : new Error('Image transform failed');
  }
}
