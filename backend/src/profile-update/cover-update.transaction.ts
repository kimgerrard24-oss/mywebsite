// backend/src/profile-update/cover-update.transaction.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PostType,
  PostVisibility,
  ProfileDraftStatus,
  ProfileUpdateDraft,
} from '@prisma/client';

interface PublishCoverUpdateParams {
  userId: string;
  draft: Pick<
    ProfileUpdateDraft,
    'id' | 'mediaId' | 'content' | 'visibility'
  >;
  notifyFollowers?: boolean;
}

@Injectable()
export class CoverUpdateTransaction {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async publish(params: PublishCoverUpdateParams) {
    const { userId, draft } = params;

    return this.prisma.$transaction(async (tx) => {

      /**
       * 1️⃣ Update authoritative cover state
       */
      await tx.user.update({
        where: { id: userId },
        data: {
          coverMediaId: draft.mediaId,
        },
      });

      /**
       * 2️⃣ Create cover update post
       */
      const post = await tx.post.create({
        data: {
          authorId: userId,
          content: draft.content ?? '',
          type: PostType.COVER_UPDATE,
          visibility: draft.visibility as PostVisibility,
          media: {
            create: {
              mediaId: draft.mediaId,
            },
          },
        },
      });

      /**
       * 3️⃣ Mark draft as published
       */
      await tx.profileUpdateDraft.update({
        where: { id: draft.id },
        data: {
          status: ProfileDraftStatus.PUBLISHED,
        },
      });

      return post;
    });
  }
}
