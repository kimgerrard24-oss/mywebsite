// backend/src/admin/audit/admin-audit.service.ts

import { UnauthorizedException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/middleware/request-context.service';

@Injectable()
export class AdminAuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: RequestContextService,
  ) {}

  async log(params: {
    action: string;
    targetId?: string;
    detail?: any;
  }) {
    const admin = this.ctx.getUser();

    if (!admin) {
      throw new UnauthorizedException(
        'Admin context missing for audit log',
      );
    }

    await this.prisma.adminActionLog.create({
      data: {
        adminId: admin.userId,
        action: params.action,
        targetId: params.targetId,
        detail: params.detail,
        ip: this.ctx.getIp(),
      },
    });
  }
}
