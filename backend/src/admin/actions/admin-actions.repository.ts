// backend/src/admin/actions/admin-actions.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAdminActionsQueryDto } from './dto/get-admin-actions.query.dto';

@Injectable()
export class AdminActionsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findActions(
    query: GetAdminActionsQueryDto,
  ) {
    const where: any = {};

    if (query.actionType) {
      where.actionType = query.actionType;
    }

    if (query.targetType) {
      where.targetType = query.targetType;
    }

    const [items, total] =
      await this.prisma.$transaction([
        this.prisma.moderationAction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          include: {
            admin: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        }),
        this.prisma.moderationAction.count({
          where,
        }),
      ]);

    return { items, total };
  }

  async findById(id: string) {
  return this.prisma.moderationAction.findUnique({
    where: { id },
    select: {
      id: true,
      actionType: true,
      targetType: true,
      targetId: true,
      reason: true,
      createdAt: true,
      admin: {
        select: {
          id: true,
          username: true,
          displayName: true,
          role: true,
        },
      },
    },
  });
}

}

