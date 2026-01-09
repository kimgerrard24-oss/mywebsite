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
    const rows = await this.repo.findAppeals(
      params,
    );

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

  async resolveAppeal(
  adminUserId: string,
  input: ResolveAppealInput,
) {
  const result = await this.repo.resolveAppealTx({
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

  if (result.status !== 'PENDING') {
    throw new BadRequestException(
      'Appeal already resolved',
    );
  }

  // ✅ DB → Notification → Realtime
 await this.notification.createNotification({
  userId: result.userId,        // เจ้าของ appeal
  actorUserId: adminUserId,     // ✅ admin ที่ resolve
  type: 'appeal_resolved',
  entityId: result.id,
  payload: {
    appealId: result.id,
    decision: input.decision,
  },
});



  return { success: true };
}


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


