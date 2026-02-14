// backend/src/profile-update/profile-update.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileDraftStatus } from '@prisma/client';

@Injectable()
export class ProfileUpdateRepository {
  constructor(private readonly prisma: PrismaService) {}

  findDraft(userId: string, type: any) {
    return this.prisma.profileUpdateDraft.findFirst({
      where: {
        userId,
        type,
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
          type: data.type,
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
