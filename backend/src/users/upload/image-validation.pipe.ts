// backend/src/users/upload/image-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

export class ImageValidationPipe
  implements PipeTransform<Express.Multer.File | undefined>
{
  async transform(
    file: Express.Multer.File | undefined,
  ): Promise<Express.Multer.File> {
    // 1) ต้องมีไฟล์และ buffer
    if (!file?.buffer) {
      throw new BadRequestException('Invalid image content');
    }

    // 2) ตรวจ magic bytes (ไม่ trust mimetype จาก client)
    let type;
    try {
      type = await fileTypeFromBuffer(file.buffer);
    } catch {
      throw new BadRequestException('Invalid image content');
    }

    if (!type) {
      throw new BadRequestException('Invalid image content');
    }

    /**
     * 3) อนุญาต image formats เท่านั้น
     * NOTE:
     * - HEIC / HEIF อนุญาตให้ผ่าน
     * - การ decode / convert จะทำใน transformImage (sharp)
     */
    if (!type.mime.startsWith('image/')) {
      throw new BadRequestException('Invalid image content');
    }

    return file;
  }
}
