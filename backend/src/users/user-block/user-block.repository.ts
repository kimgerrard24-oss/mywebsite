// backend/src/users/user-block/user-block.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserBlockRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ===== ใช้ตอน block =====
  async findTargetUserForBlock(userId: string) {
    const user =
      await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          isDisabled: true,
        },
      });

    return user;
  }

  async assertNotAlreadyBlocked(params: {
    blockerId: string;
    blockedId: string;
  }) {
    const { blockerId, blockedId } = params;

    const exists =
      await this.prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId,
          },
        },
        select: { blockerId: true },
      });

    return Boolean(exists);
  }

  async createBlock(params: {
    blockerId: string;
    blockedId: string;
  }) {
    const { blockerId, blockedId } = params;

    await this.prisma.userBlock.create({
      data: {
        blockerId,
        blockedId,
      },
    });
  }

  // ===== ใช้ตอน unblock =====

  async blockExists(params: {
    blockerId: string;
    blockedId: string;
  }): Promise<boolean> {
    const { blockerId, blockedId } = params;

    const exists =
      await this.prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId,
          },
        },
        select: { blockerId: true },
      });

    return Boolean(exists);
  }

  async deleteBlock(params: {
    blockerId: string;
    blockedId: string;
  }) {
    const { blockerId, blockedId } = params;

    await this.prisma.userBlock.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });
  }

  async findMyBlockedUsers(params: {
    blockerId: string;
    cursor?: string;
    limit: number;
  }): Promise<{
    items: Array<{
      blockedId: string;
      createdAt: Date;
      user: {
        id: string;
        displayName: string | null;
        username: string;
        avatarUrl: string | null;
      };
    }>;
  }> {
    const { blockerId, cursor, limit } = params;

    const rows =
      await this.prisma.userBlock.findMany({
        where: {
          blockerId,
        },
        take: limit + 1,
        ...(cursor
          ? {
              skip: 1,
              cursor: {
                blockerId_blockedId: {
                  blockerId,
                  blockedId: cursor,
                },
              },
            }
          : {}),
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          blockedId: true,
          createdAt: true,
          blocked: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

    return {
      items: rows.map((r) => ({
        blockedId: r.blockedId,
        createdAt: r.createdAt,
        user: r.blocked,
      })),
    };
  }
  
}
