// backend/src/users/export/profile-export.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfileExportRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async aggregateUserData(userId: string) {
    const user =
      await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          bio: true,
          createdAt: true,

          posts: {
            where: { isDeleted: false },
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
          },

          comments: {
            where: { isDeleted: false },
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
          },

          followers: {
            select: { followerId: true },
          },

          following: {
            select: { followingId: true },
          },
        },
      });

    return user;
  }
}
