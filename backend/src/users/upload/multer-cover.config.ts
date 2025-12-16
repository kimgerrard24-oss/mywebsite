// backend/src/users/upload/multer-cover.config.ts

import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

type FileInterceptorOptions = Parameters<typeof FileInterceptor>[1];

export const coverMulterConfig: FileInterceptorOptions = {
  /**
   * Use memory storage
   * --------------------------------------------------
   * - Required for image transform (sharp)
   * - Required for direct upload to R2 / S3
   * - Consistent with avatar upload
   */
  storage: memoryStorage(),

  /**
   * Social Media Production Standard
   * --------------------------------------------------
   * - รองรับภาพจากมือถือยุคใหม่ (12–48MP)
   * - รองรับ JPEG / PNG / WEBP / HEIC (ถ้า sharp รองรับ)
   * - จำกัดขนาดเพื่อป้องกัน abuse
   */
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },

  fileFilter(
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) {
    /**
     * IMPORTANT:
     * --------------------------------------------------
     * - ห้าม throw HttpException ที่นี่
     * - ให้ controller / service เป็นคนตัดสิน
     * - ถ้าไม่ใช่ image → acceptFile = false
     */
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      callback(null, false);
      return;
    }

    callback(null, true);
  },
};
