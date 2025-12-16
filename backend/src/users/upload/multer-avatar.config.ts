// backend/src/users/upload/multer-avatar.config.ts
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

type FileInterceptorOptions = Parameters<typeof FileInterceptor>[1];

export const avatarMulterConfig: FileInterceptorOptions = {
 
  storage: memoryStorage(),

 
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },

  fileFilter(
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) {
  
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      callback(null, false);
      return;
    }

    callback(null, true);
  },
};

