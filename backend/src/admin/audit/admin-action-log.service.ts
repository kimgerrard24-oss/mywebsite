// backend/src/admin/audit/admin-action-log.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminActionLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    adminId: string;
    targetUserId?: string;
    action: string;
    detail?: any;
    ip?: string;
    reportId?: string;
    appealId?: string;
  }) {
    await this.prisma.adminActionLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        targetId: params.targetUserId,
        detail: params.detail ?? null,
        ip: params.ip ?? null,
        reportId: params.reportId ?? null,
        appealId: params.appealId ?? null,
      },
    });
  }
}
