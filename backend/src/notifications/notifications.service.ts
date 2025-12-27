// backend/src/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NotificationMapper } from './mapper/notification.mapper';
import { NotificationVisibilityPolicy } from './policy/notification-visibility.policy';
import { NotificationCacheService } from './cache/notification-cache.service';
import { NotificationRow } from './types/notification-row.type';

// ✅ import type ใหม่
import { NotificationCreateInput } from './types/notification-create.input';
import { NotificationPayloadMap } from './types/notification-payload.type';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repo: NotificationsRepository,
    private readonly cache: NotificationCacheService,
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

    // defensive
    if (userId === actorUserId) return;

    await this.repo.create({
      userId,
      actorUserId,
      type,
      entityId,
    });
  }
}
