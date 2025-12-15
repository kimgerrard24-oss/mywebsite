import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class AuditLogService {
constructor(private readonly prisma: PrismaService) {}


async log(params: {
  userId?: string;
  email?: string;
  action: string;
  success: boolean;
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
      reason: params.reason,
      ip: params.ip,
      userAgent: params.userAgent,
      metadata: params.metadata,
    },
  });
}


}
