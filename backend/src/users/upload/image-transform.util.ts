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

/* =====================================================================
 * NEW: Generic image transformer (cover / banner / media)
 * =====================================================================
 * - Reuse same security guarantees as avatar
 * - Allow dynamic size
 * - Still safe for public upload API
 * - DOES NOT affect existing transformImage()
 */

export async function transformImageWithOptions(
  input: Buffer,
  options: {
    width: number;
    height: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    quality?: number;
  },
): Promise<Buffer> {
  if (!input || !Buffer.isBuffer(input)) {
    throw new Error('Invalid image buffer');
  }

  const {
    width,
    height,
    fit = 'cover',
    quality = 85,
  } = options;

  try {
    return await sharp(input, {
      limitInputPixels: 20_000_000, // same hard limit as avatar
    })
      .rotate()

      .resize(width, height, {
        fit,
        withoutEnlargement: true,
      })

      .toFormat('webp', {
        quality,
        effort: 4,
      })

      .toBuffer();
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Image transform failed');
  }
}
