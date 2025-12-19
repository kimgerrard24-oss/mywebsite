// backend/src/media/media.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Media, MediaType } from '@prisma/client';

@Injectable()
export class MediaRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(params: {
    ownerUserId: string;
    objectKey: string;
    mediaType: MediaType;
    mimeType: string;
  }): Promise<Media> {
    return this.prisma.media.create({
      data: {
        ownerUserId: params.ownerUserId,
        objectKey: params.objectKey,
        mediaType: params.mediaType,
        mimeType: params.mimeType,
      },
    });
  }

  async existsByObjectKey(
    objectKey: string,
  ): Promise<boolean> {
    const count = await this.prisma.media.count({
      where: { objectKey },
    });

    return count > 0;
  }
}
