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

  async findMediaById(mediaId: string) {
  return this.prisma.media.findUnique({
    where: {
      id: mediaId,
    },
    select: {
      id: true,
      objectKey: true,
      mediaType: true,
      mimeType: true,
      ownerUserId: true,
      createdAt: true,
      deletedAt: true,

      owner: {
        select: {
          id: true,
        },
      },

      posts: {
        select: {
          post: {
            select: {
              id: true,
              isDeleted: true,
              isHidden: true,
            },
          },
        },
        take: 1, // media ผูกกับ post เดียวในระบบคุณ
      },
    },
  });
 }

  async update(
    mediaId: string,
    data: {
      thumbnailObjectKey?: string | null;
      width?: number | null;
      height?: number | null;
      duration?: number | null;
    },
  ) {
    return this.prisma.media.update({
      where: { id: mediaId },
      data: {
        ...(data.thumbnailObjectKey !== undefined
          ? { thumbnailObjectKey: data.thumbnailObjectKey }
          : {}),

        ...(data.width !== undefined
          ? { width: data.width }
          : {}),

        ...(data.height !== undefined
          ? { height: data.height }
          : {}),

        ...(data.duration !== undefined
          ? { duration: data.duration }
          : {}),
      },
    });
  }

async findOwnerMediaPaginated(params: {
  ownerUserId: string;
  mediaType?: MediaType;
  cursor?: string;
  limit: number;
}) {
  const { ownerUserId, mediaType, cursor, limit } = params;

  return this.prisma.media.findMany({
    where: {
      ownerUserId,
      deletedAt: null,
      mediaType: {
        in: [MediaType.IMAGE, MediaType.VIDEO],
      },
      ...(mediaType ? { mediaType } : {}),
    },
    include: {
      posts: {
        take: 1,
        include: {
          post: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' },
    ],
    take: limit + 1,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor },
        }
      : {}),
  });
}



}
