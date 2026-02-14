// backend/src/profile-update/profile-update.transaction.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostType } from '@prisma/client';

@Injectable()
export class ProfileUpdateTransaction {
  constructor(private readonly prisma: PrismaService) {}

  async publish(params: {
    userId: string;
    draft: any;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          authorId: params.userId,
          content: params.draft.content ?? '',
          type:
            params.draft.type === 'AVATAR'
              ? PostType.PROFILE_UPDATE
              : PostType.COVER_UPDATE,
          visibility: params.draft.visibility,
          media: {
            create: {
              mediaId: params.draft.mediaId,
            },
          },
        },
      });

      await tx.profileUpdateDraft.update({
        where: { id: params.draft.id },
        data: { status: 'PUBLISHED' },
      });

      return post;
    });
  }
}
