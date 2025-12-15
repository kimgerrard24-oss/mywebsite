// backend/src/users/upload/image-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

export class ImageValidationPipe implements PipeTransform {
  async transform(file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('Missing file buffer');
    }

    const type = await fileTypeFromBuffer(file.buffer);

    if (
      !type ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(type.mime)
    ) {
      throw new BadRequestException('Unsupported image format');
    }

    return file;
  }
}

