// backend/src/admin/shares/shares.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SharesRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async loadContext(params: { shareId: string }) {
    const share = await this.prisma.share.findUnique({
      where: { id: params.shareId },
      select: {
        id: true,
        isDisabled: true,
        senderId: true,
        postId: true,
      },
    });

    return { share };
  }

  async disableShare(params: {
    shareId: string;
    adminUserId: string;
    reason: string;
  }) {
    return this.prisma.share.update({
      where: { id: params.shareId },
      data: {
        isDisabled: true,
        disabledAt: new Date(),
        disabledByAdminId: params.adminUserId,
        disabledReason: params.reason,
      },
      select: {
        id: true,
        disabledAt: true,
        disabledByAdminId: true,
      },
    });
  }
}
