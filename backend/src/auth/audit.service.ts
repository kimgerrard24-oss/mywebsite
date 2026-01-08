// backend/src/auth/audit.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Sentry from '@sentry/node';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  constructor(private prisma: PrismaService) {}

  // =====================================================
  // Public: Generic Audit Log
  // =====================================================

  /**
   * สร้าง audit log แบบทั่วไป (ใช้สำหรับ action อื่น ๆ)
   * IMPORTANT:
   * - must NEVER throw
   * - best-effort only
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
          metadata: this.sanitizeMetadata(metadata),
        },
      });
    } catch (err: unknown) {
      const error = err as Error;

      this.logger.error(
        `Failed to create audit log: ${error.message}`,
      );

      try {
        Sentry.captureException(error, {
          tags: { module: 'audit' },
          extra: {
            action,
            success,
            targetId,
            reason,
          },
        });
      } catch {
        // must never throw
      }
    }
  }

  // =====================================================
  // Public: Login Attempt Audit
  // =====================================================

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

      this.logger.warn(
        `Audit login logging failed: ${error.message}`,
      );

      try {
        Sentry.captureException(error, {
          tags: { module: 'audit-login' },
          extra: {
            success: payload.success,
            reason: payload.reason,
          },
        });
      } catch {
        // must never throw
      }
    }
  }

  // =====================================================
  // Public: Admin Action Helper (NEW)
  // =====================================================

  /**
   * ใช้สำหรับ admin / moderation / system action
   * เพื่อให้ format audit เหมือนกันทั้งระบบ
   */
  async logAdminAction(params: {
    adminId: string;
    action: string; // e.g. BAN_USER, HIDE_POST
    targetId?: string | null;
    reason?: string | null;
    metadata?: any | null;
    ip?: string | null;
    userAgent?: string | null;
  }) {
    return this.createLog({
      userId: params.adminId,
      action: `admin:${params.action}`,
      success: true,
      targetId: params.targetId ?? null,
      reason: params.reason ?? null,
      metadata: params.metadata ?? null,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
    });
  }

  // =====================================================
  // Internal Helpers
  // =====================================================

  /**
   * Prevent huge / unsafe metadata from going to DB
   * (DB audit should stay lean and queryable)
   */
  private sanitizeMetadata(input: any) {
    if (!input) return null;

    try {
      const json = JSON.stringify(input);

      // hard limit ~4KB
      if (json.length > 4096) {
        return {
          _truncated: true,
          keys: Object.keys(input ?? {}),
        };
      }

      return input;
    } catch {
      return { _invalid_metadata: true };
    }
  }
  
}
