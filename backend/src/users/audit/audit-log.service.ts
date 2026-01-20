// backend/src/users/audit/audit-log.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityEventType } from '@prisma/client';


@Injectable()
export class AuditLogService {
constructor(private readonly prisma: PrismaService) {}


async log(params: {
  userId?: string;
  email?: string;
  action: string;
  success: boolean;
  targetId?: string;
  reason?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) {
  await this.prisma.auditLog.create({
    data: {
      userId: params.userId,
      email: params.email ?? 'system',
      action: params.action,
      success: params.success,
      targetId: params.targetId,
      reason: params.reason,
      ip: params.ip,
      userAgent: params.userAgent,
      metadata: params.metadata,
    },
  });
}

async logSecurityEvent(params: {
  userId: string;
  type: SecurityEventType;
  metadata?: any;
}) {
  return this.prisma.securityEvent.create({
    data: {
      userId: params.userId,
      type: params.type,
      metadata: params.metadata,
    },
  });
}

}
