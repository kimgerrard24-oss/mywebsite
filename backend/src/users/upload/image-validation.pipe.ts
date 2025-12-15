// backend/src/users/upload/image-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

export class ImageValidationPipe implements PipeTransform {
  async transform(
    file: Express.Multer.File,
  ): Promise<Express.Multer.File> {
    if (!file?.buffer) {
      throw new BadRequestException('Invalid image content');
    }

    const type = await fileTypeFromBuffer(file.buffer);

    if (
      !type ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(type.mime)
    ) {
      throw new BadRequestException('Invalid image content');
    }

    return file;
  }
}


