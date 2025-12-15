// backend/src/users/upload/multer-avatar.config.ts
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

type FileInterceptorOptions = Parameters<typeof FileInterceptor>[1];

export const avatarMulterConfig: FileInterceptorOptions = {
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },

  fileFilter(
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) {
    /**
     * NOTE:
     * - ห้าม throw HttpException ที่นี่
     * - อย่าส่ง Error ถ้าไม่จำเป็น
     * - ให้ controller เป็นคนจัดการกรณี file === undefined
     */
    if (!file.mimetype.startsWith('image/')) {
      callback(null, false);
      return;
    }

    callback(null, true);
  },
};
