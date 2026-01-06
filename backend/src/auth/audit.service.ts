// backend/src/auth/audit.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Sentry from '@sentry/node';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  constructor(private prisma: PrismaService) {}

  /**
   * สร้าง audit log แบบทั่วไป (ใช้สำหรับ action อื่น ๆ)
   */
  async createLog(params: {
    userId: string | null;
    action: string;
    email?: string | null; 
    success: boolean;
    reason?: string | null;
    targetId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    metadata?: any | null;
  }) {
    const {
      userId,
      action,
      email = null, 
      success,
      reason = null,
      targetId = null,
      ip = null,
      userAgent = null,
      metadata = null,
    } = params;

    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          email,
          action,
          success,
          reason,
          targetId,
          ip,
          userAgent,
          metadata,
        },
      });
    } catch (err: unknown) {
      const error = err as Error;

      this.logger.error(`Failed to create audit log: ${error.message}`);

      Sentry.captureException(error, {
        tags: { module: 'audit' },
        extra: params,
      });
    }
  }

  /**
   * สำหรับ Login Attempt โดยเฉพาะ
   * (AuthService เรียกใช้ โดยไม่ต้องส่งข้อมูลเยอะ)
   */
  async logLoginAttempt(payload: {
    userId?: string | null;
    email: string; 
    ip?: string | null;
    userAgent?: string | null;
    success: boolean;
    reason?: string | null;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: payload.userId ?? null,
          email: payload.email,
          action: 'login_attempt',
          success: payload.success,
          reason: payload.reason ?? null,
          targetId: null,
          ip: payload.ip ?? null,
          userAgent: payload.userAgent ?? null,
          metadata: Prisma.JsonNull,
        },
      });
    } catch (err) {
      const error = err as Error;

      this.logger.warn(`Audit login logging failed: ${error.message}`);

      Sentry.captureException(error, {
        tags: { module: 'audit-login' },
        extra: payload,
      });
    }
  }
}
