// backend/src/profile-update/cover-update.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileDraftStatus } from '@prisma/client';

@Injectable()
export class CoverUpdateRepository {
  constructor(private readonly prisma: PrismaService) {}

  findDraft(userId: string) {
    return this.prisma.profileUpdateDraft.findFirst({
      where: {
        userId,
        type: 'COVER',
        status: ProfileDraftStatus.DRAFT,
        deletedAt: null,
      },
    });
  }

  upsertDraft(data: any) {
    return this.prisma.profileUpdateDraft.upsert({
      where: {
        userId_type_status: {
          userId: data.userId,
          type: 'COVER',
          status: ProfileDraftStatus.DRAFT,
        },
      },
      update: data,
      create: data,
    });
  }

  markPublished(id: string) {
    return this.prisma.profileUpdateDraft.update({
      where: { id },
      data: { status: ProfileDraftStatus.PUBLISHED },
    });
  }
}
