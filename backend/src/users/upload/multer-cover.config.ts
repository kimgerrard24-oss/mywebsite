// backend/src/users/upload/multer-cover.config.ts
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

type FileInterceptorOptions = Parameters<typeof FileInterceptor>[1];

export const avatarMulterConfig: FileInterceptorOptions = {
  limits: {
    /**
     * Social Media Production Standard
     * --------------------------------------------------
     * - รองรับภาพจากมือถือยุคใหม่ (12–48MP)
     * - รองรับ HEIC / large JPEG
     * - ปลอดภัยร่วมกับ sharp limitInputPixels
     */
    fileSize: 20 * 1024 * 1024, // 20MB
  },

  fileFilter(
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) {
    /**
     * NOTE:
     * - ห้าม throw HttpException ที่นี่
     * - ให้ controller/service เป็นคนจัดการกรณี file === undefined
     */
    if (!file.mimetype.startsWith('image/')) {
      callback(null, false);
      return;
    }

    callback(null, true);
  },
};

