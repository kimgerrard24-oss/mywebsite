// backend/src/users/upload/image-transform.util.ts
import sharp from 'sharp';

/**
 * Transform & normalize avatar image
 *
 * Standards (Social Media):
 * - Accept high-resolution input (mobile / camera / screenshot)
 * - Enforce hard pixel limit to prevent image bomb
 * - Normalize orientation (EXIF)
 * - Resize to fixed square avatar
 * - Strip metadata (privacy)
 * - Convert to efficient format (webp)
 *
 * NOTE:
 * - This utility MUST NOT throw HttpException
 * - Service layer is responsible for mapping errors
 */
export async function transformImage(
  input: Buffer,
): Promise<Buffer> {
  // --------------------------------------------------
  // Defensive guard (utility-level)
  // --------------------------------------------------
  if (!input || !Buffer.isBuffer(input)) {
    throw new Error('Invalid image buffer');
  }

  try {
    return await sharp(input, {
      /**
       * HARD SECURITY LIMIT
       * ------------------------------------------------
       * Default sharp = 268M pixels (too high for API)
       *
       * 20MP is safe for:
       * - iPhone / Android photos (12–16MP)
       * - Large screenshots
       * - While still preventing image bomb attacks
       */
      limitInputPixels: 20_000_000, // ~20 megapixels
    })
      /**
       * Normalize orientation from EXIF
       * (prevents rotated avatars)
       */
      .rotate()

      /**
       * Resize to square avatar
       * - cover: crop center
       * - withoutEnlargement: prevent upscaling
       */
      .resize(512, 512, {
        fit: 'cover',
        withoutEnlargement: true,
      })

      /**
       * Strip metadata + convert to modern format
       */
      .toFormat('webp', {
        quality: 85, // balanced quality / size
        effort: 4,   // reasonable CPU cost for API
      })

      .toBuffer();
  } catch (error) {
    /**
     * DO NOT throw HttpException here
     * Let service layer decide how to map error
     */
    throw error instanceof Error
      ? error
      : new Error('Image transform failed');
  }
}

