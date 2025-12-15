// backend/src/users/avatar/avatar.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { R2Service } from '../../r2/r2.service';
import { buildAvatarPath } from './avatar-path.util';
import { transformImage } from '../upload/image-transform.util';
import { buildCdnUrl } from './cdn-url.util';

@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name);

  constructor(private readonly r2: R2Service) {}

  async processAndUpload(params: {
    userId: string;
    file: Express.Multer.File;
  }) {
    const { userId, file } = params;

    // CHECKPOINT 1: service ถูกเรียก
    this.logger.log(
      `Avatar upload start: userId=${userId}, ` +
      `file=${file?.originalname}, ` +
      `size=${file?.size}, ` +
      `mimetype=${file?.mimetype}`,
    );

    // ✅ HARD GUARD: file ต้องมีจริง
    if (!file) {
      this.logger.error('Avatar upload failed: file is missing');
      throw new InternalServerErrorException('Invalid avatar upload');
    }

    // ✅ HARD GUARD: buffer ต้องมี (สำคัญที่สุด)
    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
      this.logger.error(
        'Avatar upload failed: file buffer is missing (check Multer memoryStorage)',
      );
      throw new InternalServerErrorException('Invalid avatar upload');
    }

    try {
      // CHECKPOINT 2: transform
      this.logger.log('Transforming avatar image...');
      const buffer = await transformImage(file.buffer);

      this.logger.log(
        `Image transformed successfully, bufferSize=${buffer.length}`,
      );

      // CHECKPOINT 3: path
      const path = buildAvatarPath(userId);
      this.logger.log(`Avatar path generated: ${path}`);

      // CHECKPOINT 4: upload R2
      this.logger.log(
        `Uploading avatar to R2: path=${path}, contentType=image/webp`,
      );

      await this.r2.upload({
        path,
        buffer,
        contentType: 'image/webp',
      });

      // CHECKPOINT 5: success
      this.logger.log(`Avatar uploaded to R2 successfully: ${path}`);

      const avatarUrl = buildCdnUrl(path);
      this.logger.log(`Avatar CDN URL generated: ${avatarUrl}`);

      return { avatarUrl };
    } catch (error) {
      this.logger.error(
        'Failed to process or upload avatar',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to update avatar',
      );
    }
  }
}
