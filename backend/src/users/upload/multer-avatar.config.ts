// backend/src/users/upload/multer-avatar.config.ts
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

type FileInterceptorOptions = Parameters<typeof FileInterceptor>[1];

/**
 * Avatar upload config (Social Media standard)
 *
 * Principles:
 * - Accept real-world mobile images (3–10MB)
 * - Reject non-image early (cheap check)
 * - Keep logic fail-soft (controller / pipe handle errors)
 * - MUST use memoryStorage for sharp processing
 */
export const avatarMulterConfig: FileInterceptorOptions = {
  /**
   * CRITICAL:
   * memoryStorage is required
   * so file.buffer is available for image transform
   */
  storage: memoryStorage(),

  /**
   * File size limit (BEFORE transform)
   *
   * Rationale:
   * - iPhone / Android photos often 3–6MB
   * - Screenshots can exceed 2MB easily
   * - Sharp will resize & compress later
   *
   * 8MB is a good balance:
   * - UX friendly
   * - Still protects server memory
   */
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },

  fileFilter(
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) {
    /**
     * IMPORTANT RULES:
     * - DO NOT throw HttpException here
     * - DO NOT leak error details
     * - Fail-soft: reject file, let pipe/controller respond
     *
     * NOTE:
     * - mimetype is NOT trusted for security
     * - real validation happens in ImageValidationPipe
     */
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      callback(null, false);
      return;
    }

    callback(null, true);
  },
};

