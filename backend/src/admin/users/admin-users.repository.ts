// backend/src/admin/users/admin-users.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
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
        isDisabled: true,
        active: true,
      },
    });
  }

  banUser(params: { userId: string; reason: string }) {
  return this.prisma.user.update({
    where: { id: params.userId },
    data: {
      isDisabled: true,
      active: false,
      disabledReason: params.reason,
      disabledAt: new Date(),
    },
  });
}

unbanUser(userId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      isDisabled: false,
      active: true,
      disabledReason: null,
      disabledAt: null,
    },
  });
}

}
