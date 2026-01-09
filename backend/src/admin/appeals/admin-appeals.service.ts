// backend/src/admin/appeals/admin-appeals.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AdminAppealsRepository } from './admin-appeals.repository';
import { NotificationsService } from '../../notifications/notifications.service';
import { AdminAppealStatsCache } from './admin-appeal-stats.cache';
import { ResolveAppealInput } from './types/resolve-appeal.input';
import { AppealStatus } from '@prisma/client';

@Injectable()
export class AdminAppealsService {
  constructor(
    private readonly repo: AdminAppealsRepository,
    private readonly notification: NotificationsService,
    private readonly cache: AdminAppealStatsCache,
  ) {}

  async getAdminAppeals(params: {
    status?: any;
    targetType?: any;
    cursor?: string;
    limit: number;
  }) {
    const rows = await this.repo.findAppeals(params);

    let nextCursor: string | null = null;

    if (rows.length > params.limit) {
      const next = rows.pop();
      nextCursor = next!.id;
    }

    return {
      items: rows,
      nextCursor,
    };
  }

  // ===== GET /admin/appeals/:id =====
  async getAdminAppealById(appealId: string) {
    const appeal =
      await this.repo.findAppealById(appealId);

    if (!appeal) {
      throw new NotFoundException(
        'Appeal not found',
      );
    }

    return appeal;
  }

  // ===== POST /admin/appeals/:id/resolve =====
  async resolveAppeal(
    adminUserId: string,
    input: ResolveAppealInput,
  ) {
    const result =
      await this.repo.resolveAppealTx({
        adminUserId,
        appealId: input.appealId,
        decision: input.decision,
        resolutionNote: input.resolutionNote,
      });

    if (!result) {
      throw new NotFoundException(
        'Appeal not found',
      );
    }

    /**
     * repo จะ return record เดิมถ้า status !== PENDING
     * เราจึงเช็คที่นี่เพื่อกัน double resolve
     */
    if (result.status !== AppealStatus.PENDING) {
      throw new BadRequestException(
        'Appeal already resolved',
      );
    }

    /**
     * ===== Notify user (fail-soft) =====
     * DB is authority, notification must not break flow
     */
    try {
      await this.notification.createNotification({
        userId: result.userId, // owner of appeal
        actorUserId: adminUserId, // admin actor
        type: 'appeal_resolved',
        entityId: result.id,
        payload: {
          appealId: result.id,
          decision: input.decision,
        },
      });
    } catch {
      // fail-soft: notification error must not rollback appeal
    }

    /**
     * ===== Invalidate stats cache =====
     * any resolve affects dashboard stats
     */
    try {
      await this.cache.invalidateAll();
    } catch {
      // cache fail-soft
    }

    return { success: true };
  }

  // ===== GET /admin/appeals/stats =====
  async getStats(params: {
    range: '24h' | '7d' | '30d';
  }) {
    const cacheKey = `admin:appeals:stats:${params.range}`;

    const cached =
      await this.cache.get(cacheKey);

    if (cached) return cached;

    const stats =
      await this.repo.aggregateStats(
        params.range,
      );

    await this.cache.set(cacheKey, stats);

    return stats;
  }
}
