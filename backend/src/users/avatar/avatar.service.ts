// backend/src/users/avatar/avatar.service.ts
import { Injectable } from '@nestjs/common';
import { R2Service } from '../../r2/r2.service';
import { buildAvatarPath } from './avatar-path.util';
import { transformImage } from '../upload/image-transform.util';
import { buildCdnUrl } from './cdn-url.util';

@Injectable()
export class AvatarService {
  constructor(private readonly r2: R2Service) {}

  async processAndUpload(params: {
    userId: string;
    file: Express.Multer.File;
  }) {
    const buffer = await transformImage(params.file.buffer);

    const path = buildAvatarPath(params.userId);

    await this.r2.upload({
      path,
      buffer,
      contentType: 'image/webp',
    });

    const avatarUrl = buildCdnUrl(path);

    return { avatarUrl };
  }
}
