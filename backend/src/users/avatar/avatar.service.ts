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
    try {
      const buffer = await transformImage(params.file.buffer);

      const path = buildAvatarPath(params.userId);

      await this.r2.upload({
        path,
        buffer,
        contentType: 'image/webp',
      });

      const avatarUrl = buildCdnUrl(path);

      return { avatarUrl };
    } catch (error) {
      this.logger.error(
        'Failed to process or upload avatar',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to update avatar',
      );
    }
  }
}
