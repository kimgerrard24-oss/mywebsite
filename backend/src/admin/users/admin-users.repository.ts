// backend/src/admin/users/admin-users.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type FindUsersParams = {
  page: number;
  limit: number;
  search: string | null;
};

@Injectable()
export class AdminUsersRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findUsers(params: FindUsersParams) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput | undefined =
      search
        ? {
            OR: [
              {
                email: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                displayName: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : undefined;

    const [items, total] =
      await this.prisma.$transaction([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            role: true,
            isBanned: true,      // ✅ FIX
            active: true,
            createdAt: true,
            displayName: true,
            avatarUrl: true,
          },
        }),
        this.prisma.user.count({ where }),
      ]);

    return [items, total] as const;
  }

  findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        isBanned: true,        // ✅ FIX
      },
    });
  }

  banUser(params: { userId: string; reason: string }) {
    return this.prisma.user.update({
      where: { id: params.userId },
      data: {
        isBanned: true,        // ✅ FIX
        bannedAt: new Date(),
        banReason: params.reason,
      },
    });
  }

  unbanUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,       // ✅ FIX
        bannedAt: null,
        banReason: null,
      },
    });
  }

   async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        isDisabled: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });
  }
}
