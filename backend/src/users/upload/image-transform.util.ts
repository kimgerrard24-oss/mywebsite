// backend/src/users/upload/image-transform.util.ts
import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

/**
 * Transform & normalize avatar image
 *
 * - resize ให้เป็นขนาดคงที่
 * - strip metadata ทั้งหมด
 * - convert เป็น webp
 * - ป้องกัน image bomb / malformed image
 *
 * ⚠️ ใช้กับ avatar เท่านั้น (ไม่เหมาะกับ cover / original upload)
 */
export async function transformImage(
  input: Buffer,
): Promise<Buffer> {
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
 } catch {
  
    throw new BadRequestException('Invalid image content');
  }
}
