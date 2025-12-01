// file: src/audit/audit.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  constructor(private prisma: PrismaService) {}

  /**
   * Create audit log entry
   */
  async createLog(
    userId: string,
    action: string,
    targetId?: string | null,
    ip?: string | null,
    metadata?: any | null,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          targetId,
          ip,
          metadata,
        },
      });
    } catch (err: unknown) {
      const error = err as Error;

      this.logger.error(
        `Failed to create audit log: ${error.message ?? 'unknown error'}`
      );

      Sentry.captureException(error, {
        tags: { module: 'audit' },
        extra: { userId, action, targetId },
      });
    }
  }
}
