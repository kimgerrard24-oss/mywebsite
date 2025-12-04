// src/auth/services/audit-log.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  async logLoginAttempt(payload: {
    userId?: string | null;
    email: string;
    ip?: string | null;
    userAgent?: string | null;
    success: boolean;
    reason?: string | null;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: payload.userId ?? null,
          email: payload.email,
          ip: payload.ip ?? null,
          userAgent: payload.userAgent ?? null,
          action: 'login_attempt',
          success: payload.success,
          reason: payload.reason ?? null,
          occurredAt: new Date(),
        },
      });
    } catch (err) {
      // If DB write fails, fallback to logging to console/logger
      this.logger.warn('DB audit logging failed, falling back to logger. ' + (err as Error).message);
      this.logger.log({
        ...payload,
        action: 'login_attempt',
        occurredAt: new Date(),
      });
    }
  }
}
