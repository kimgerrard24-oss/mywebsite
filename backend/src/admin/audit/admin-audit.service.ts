// backend/src/admin/audit/admin-audit.service.ts

import { Injectable } from '@nestjs/common';
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
    adminId?: string; // optional override
  }) {
    try {
      const adminFromCtx = this.ctx.getUser();

      const adminId =
        params.adminId ??
        adminFromCtx?.userId ??
        null;

      // ❗ audit must never break business flow
      if (!adminId) return;

      await this.prisma.adminActionLog.create({
        data: {
          adminId,
          action: params.action,
          targetId: params.targetId,
          detail: params.detail ?? null,
          ip: this.ctx.getIp() ?? null,
        },
      });
    } catch {
      // NEVER throw from audit
    }
  }
}
