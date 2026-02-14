// backend/src/profile-update/profile-update.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ProfileDraftStatus,
  ProfileMediaType,
  PostVisibility,
  ProfileUpdateDraft,
} from '@prisma/client';

interface UpsertProfileDraftParams {
  userId: string;
  type: ProfileMediaType;
  mediaId: string;
  content?: string | null;
  visibility: PostVisibility;
}

@Injectable()
export class ProfileUpdateRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * =========================================================
   * Find active draft by user + type
   * =========================================================
   */
  findDraft(
    userId: string,
    type: ProfileMediaType,
  ): Promise<ProfileUpdateDraft | null> {
    return this.prisma.profileUpdateDraft.findFirst({
      where: {
        userId,
        type,
        status: ProfileDraftStatus.DRAFT,
        deletedAt: null,
      },
    });
  }

  /**
   * =========================================================
   * Upsert draft (1 active draft per user per type)
   * Uses composite unique key: userId_type_status
   * =========================================================
   */
  upsertDraft(
    params: UpsertProfileDraftParams,
  ): Promise<ProfileUpdateDraft> {
    const { userId, type, mediaId, content, visibility } = params;

    return this.prisma.profileUpdateDraft.upsert({
      where: {
        userId_type_status: {
          userId,
          type,
          status: ProfileDraftStatus.DRAFT,
        },
      },
      update: {
        mediaId,
        content,
        visibility,
      },
      create: {
        userId,
        type,
        mediaId,
        content,
        visibility,
        status: ProfileDraftStatus.DRAFT,
      },
    });
  }

  /**
   * =========================================================
   * Mark draft as published
   * =========================================================
   */
  markPublished(id: string): Promise<ProfileUpdateDraft> {
    return this.prisma.profileUpdateDraft.update({
      where: { id },
      data: {
        status: ProfileDraftStatus.PUBLISHED,
      },
    });
  }
}
