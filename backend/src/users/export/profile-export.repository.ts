// backend/src/users/export/profile-export.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfileExportRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Aggregate all exportable user data
   * DB = authority
   * Must NOT expose internal flags or moderation state
   */
  async aggregateUserData(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },

      select: {
        // =========================
        // Profile (PII — allowed)
        // =========================
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        createdAt: true,

        // =========================
        // Posts (non-deleted only)
        // =========================
        posts: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },

        // =========================
        // Comments (non-deleted only)
        // =========================
        comments: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },

        // =========================
        // Relations (IDs only)
        // =========================
        followers: {
          select: { followerId: true },
        },

        following: {
          select: { followingId: true },
        },
      },
    });
  }
}