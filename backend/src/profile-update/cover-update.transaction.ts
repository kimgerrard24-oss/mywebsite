// backend/src/profile-update/cover-update.transaction.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';
import { PostType } from '@prisma/client';

@Injectable()
export class CoverUpdateTransaction {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async publish(params: {
  userId: string;
  draft: any;
  notifyFollowers?: boolean;
}) {
    const { userId, draft } = params;

    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ update cover field
      await tx.user.update({
        where: { id: userId },
        data: { coverMediaId: draft.mediaId },
      });

      // 2️⃣ create post directly
      const post = await tx.post.create({
        data: {
          authorId: userId,
          content: draft.content ?? '',
          type: 'COVER_UPDATE',
          visibility: draft.visibility,
          media: {
            create: {
              mediaId: draft.mediaId,
            },
          },
        },
      });

      // 3️⃣ mark draft published
      await tx.profileUpdateDraft.update({
        where: { id: draft.id },
        data: { status: 'PUBLISHED' },
      });

      return post;
    });
  }
}
