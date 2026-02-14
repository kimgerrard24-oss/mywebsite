// backend/src/profile-update/cover-update.transaction.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';
import { PostType } from '@prisma/client';

@Injectable()
export class CoverUpdateTransaction {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
  ) {}

  async publish(params: { userId: string; draft: any }) {
    const { userId, draft } = params;

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { coverMediaId: draft.mediaId },
      });

      const post = await this.postsService.createPost({
        authorId: userId,
        typeOverride: PostType.COVER_UPDATE,
        dto: {
          content: draft.content ?? '',
          mediaIds: [draft.mediaId],
          visibility: draft.visibility,
        },
      });

      await tx.profileUpdateDraft.update({
        where: { id: draft.id },
        data: { status: 'PUBLISHED' },
      });

      return post;
    });
  }
}
