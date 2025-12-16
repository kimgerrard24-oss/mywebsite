// backend/src/users/cover/cover.service.ts
import { Injectable } from '@nestjs/common';
import { R2Service } from '../../r2/r2.service';
import { buildCoverPath } from './cover-path.util';
import { transformImageWithOptions } from '../upload/image-transform.util';

@Injectable()
export class CoverService {
  constructor(private readonly r2: R2Service) {}

  async processAndUpload(params: {
    userId: string;
    file: Express.Multer.File;
    previousCoverUrl: string | null;
  }) {
    const { userId, file, previousCoverUrl } = params;

    const transformed = await transformImageWithOptions(file.buffer, {
      width: 1500,
      height: 500,
      fit: 'cover',
      quality: 85,
    });

    const key = buildCoverPath(userId);

    await this.r2.uploadObject({
      key,
      body: transformed,
      contentType: 'image/webp',
    });

    if (previousCoverUrl) {
      await this.r2.safeDeleteByUrl(previousCoverUrl);
    }

    const coverUrl = this.r2.buildPublicUrl(key);

    return { coverUrl };
  }
}
