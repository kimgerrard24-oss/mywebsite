// backend/src/users/cover/cover.service.ts

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { R2Service } from '../../r2/r2.service';
import { buildCoverPath } from './cover-path.util';
import { transformImageWithOptions } from '../upload/image-transform.util';

@Injectable()
export class CoverService {
  private readonly logger = new Logger(CoverService.name);

  constructor(private readonly r2: R2Service) {}

  async processAndUpload(params: {
    userId: string;
    file: Express.Multer.File;
    previousCoverUrl: string | null;
  }) {
    const { userId, file, previousCoverUrl } = params;

    // CHECKPOINT 1: service ถูกเรียก
    this.logger.log(
      `Cover upload start: userId=${userId}, ` +
        `file=${file?.originalname}, ` +
        `size=${file?.size}, ` +
        `mimetype=${file?.mimetype}`,
    );

    // ✅ HARD GUARD: file ต้องมีจริง
    if (!file) {
      this.logger.error('Cover upload failed: file is missing');
      throw new InternalServerErrorException('Invalid cover upload');
    }

    // ✅ HARD GUARD: buffer ต้องมี (สำคัญมาก)
    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
      this.logger.error(
        'Cover upload failed: file buffer is missing (check Multer memoryStorage)',
      );
      throw new InternalServerErrorException('Invalid cover upload');
    }

    try {
      // CHECKPOINT 2: transform
      this.logger.log('Transforming cover image...');
      const transformed = await transformImageWithOptions(file.buffer, {
        width: 1500,
        height: 500,
        fit: 'cover',
        quality: 85,
      });

      this.logger.log(
        `Cover image transformed successfully, bufferSize=${transformed.length}`,
      );

      // CHECKPOINT 3: path
      const path = buildCoverPath(userId);
      this.logger.log(`Cover path generated: ${path}`);

      // CHECKPOINT 4: upload R2
      this.logger.log(
        `Uploading cover to R2: path=${path}, contentType=image/webp`,
      );

      await this.r2.upload({
        path,
        buffer: transformed,
        contentType: 'image/webp',
      });

      this.logger.log(`Cover uploaded to R2 successfully: ${path}`);

      // CHECKPOINT 5: delete previous cover (FAIL-SOFT)
      if (previousCoverUrl) {
        this.logger.log(
          `Deleting previous cover: url=${previousCoverUrl}`,
        );

        try {
          await this.r2.safeDeleteByUrl(previousCoverUrl);
        } catch (err) {
          // ❗ fail-soft: ลบไม่สำเร็จไม่ควรพัง upload ใหม่
          this.logger.warn(
            `Failed to delete previous cover (ignored): ${previousCoverUrl}`,
          );
        }
      }

      const coverUrl = this.r2.buildPublicUrl(path);
      this.logger.log(`Cover CDN URL generated: ${coverUrl}`);

      return { coverUrl };
    } catch (error) {
      this.logger.error(
        'Failed to process or upload cover',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to update cover',
      );
    }
  }
}
