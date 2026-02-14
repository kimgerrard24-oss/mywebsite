// backend/src/profile-update/profile-update.transaction.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PostType,
  PostVisibility,
  ProfileDraftStatus,
  ProfileMediaType,
  ProfileUpdateDraft,
} from '@prisma/client';

interface PublishProfileUpdateParams {
  userId: string;
  draft: Pick<
    ProfileUpdateDraft,
    'id' | 'type' | 'mediaId' | 'content' | 'visibility'
  >;
}

@Injectable()
export class ProfileUpdateTransaction {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async publish(params: PublishProfileUpdateParams) {
    const { userId, draft } = params;

    return this.prisma.$transaction(async (tx) => {

      /**
       * 1️⃣ Determine PostType from ProfileMediaType enum
       */
      const postType =
        draft.type === ProfileMediaType.AVATAR
          ? PostType.PROFILE_UPDATE
          : PostType.COVER_UPDATE;

      /**
       * 2️⃣ Create post
       */
      const post = await tx.post.create({
        data: {
          authorId: userId,
          content: draft.content ?? '',
          type: postType,
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
