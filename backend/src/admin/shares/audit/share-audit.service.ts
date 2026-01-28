// backend/src/admin/shares/audit/share-audit.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ShareAuditService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async log(params: {
    adminUserId: string;
    shareId: string;
    reason: string;
  }) {
    await this.prisma.moderationAction.create({
      data: {
        adminId: params.adminUserId,
        actionType: 'HIDE',
        targetType: 'FOLLOW', // closest semantic
        targetId: params.shareId,
        reason: params.reason,
      },
    });
  }
}
