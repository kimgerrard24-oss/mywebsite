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
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Invalid file type'), false);
      return;
    }

    callback(null, true);
  },
};





