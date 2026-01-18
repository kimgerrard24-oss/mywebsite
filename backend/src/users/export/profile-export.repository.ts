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
   * Must NOT expose internal flags, moderation state, or auth data
   *
   * NOTE:
   * - Explicit allow-list only
   * - No tokens, no provider ids, no status flags
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
          where: {
            isDeleted: false,
          },
          orderBy: {
            createdAt: 'asc',
          },
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
          where: {
            isDeleted: false,
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },

        // =========================
        // Security Events (safe subset)
        // =========================
        securityEvents: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            type: true,
            ip: true,
            userAgent: true,
            createdAt: true,
          },
        },

        // =========================
        // Relations (count only)
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
