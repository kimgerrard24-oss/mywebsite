// backend/src/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NotificationMapper } from './mapper/notification.mapper';
import { NotificationVisibilityPolicy } from './policy/notification-visibility.policy';
import { NotificationCacheService } from './cache/notification-cache.service';
import { NotificationRow } from './types/notification-row.type';
import { NotificationCreateInput } from './types/notification-create.input';
import { NotificationPayloadMap } from './types/notification-payload.type';
import { NotificationRealtimeService } from './realtime/notification-realtime.service'
@Injectable()
export class NotificationsService {
  constructor(
    private readonly repo: NotificationsRepository,
    private readonly cache: NotificationCacheService,
    private readonly realtime: NotificationRealtimeService,
   ) {}

  async getNotifications(params: {
    viewerUserId: string;
    cursor: string | null;
    limit: number;
  }) {
    const { viewerUserId, cursor, limit } = params;

    // 🔐 visibility rule (defensive, future-proof)
    NotificationVisibilityPolicy.assertCanView(viewerUserId);

    // 🚀 cache (fail-soft)
    const cached = await this.cache.get(viewerUserId, cursor);
    if (cached) return cached;

    const rows = await this.repo.findMany({
      userId: viewerUserId,
      cursor,
      limit,
    });

    const items = rows.map((row: NotificationRow) =>
      NotificationMapper.toDto(row),
    );

    const nextCursor =
      items.length === limit
        ? items[items.length - 1].id
        : null;

    const response = {
      items,
      nextCursor,
    };

    await this.cache.set(viewerUserId, cursor, response);

    return response;
  }

  async markNotificationRead(params: {
    notificationId: string;
    viewerUserId: string;
  }) {
    const { notificationId, viewerUserId } = params;

    const notification = await this.repo.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    NotificationVisibilityPolicy.assertOwner({
      notificationUserId: notification.userId,
      viewerUserId,
    });

    await this.repo.markAsRead({
      id: notificationId,
      userId: viewerUserId,
    });

    // invalidate cache (fail-soft)
    await this.cache.invalidateList(viewerUserId);

    return { success: true };
  }

  // ✅ PRODUCTION-GRADE VERSION
  async createNotification<
  T extends keyof NotificationPayloadMap,
>(params: NotificationCreateInput<T>) {
  const { userId, actorUserId, type, entityId } = params;

  // 🔐 defensive: ไม่แจ้งเตือนตัวเอง
  if (userId === actorUserId) return;

  // 1️⃣ Persist (authority = DB)
  const row = await this.repo.create({
    userId,
    actorUserId,
    type,
    entityId,
  });

  // 2️⃣ Realtime emit (fail-soft)
  try {
    const dto = NotificationMapper.toDto(row);

    this.realtime.emitNewNotification(userId, {
      notification: dto,
    });
  } catch {
    /**
     * ❗ สำคัญมาก
     * - realtime พังได้
     * - ห้ามทำให้ notification หลักพัง
     * - DB คือ source of truth
     */
  }
}

}
