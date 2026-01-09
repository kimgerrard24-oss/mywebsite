// backend/src/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NotificationMapper } from './mapper/notification.mapper';
import { NotificationVisibilityPolicy } from './policy/notification-visibility.policy';
import { NotificationCacheService } from './cache/notification-cache.service';
import { NotificationRow } from './types/notification-row.type';
import { NotificationCreateInput } from './types/notification-create.input';
import { NotificationPayloadMap } from './types/notification-payload.type';
import { NotificationRealtimeService } from './realtime/notification-realtime.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../auth/audit.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repo: NotificationsRepository,
    private readonly cache: NotificationCacheService,
    private readonly realtime: NotificationRealtimeService,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getNotifications(params: {
    viewerUserId: string;
    cursor: string | null;
    limit: number;
  }) {
    const { viewerUserId, cursor, limit } = params;

    NotificationVisibilityPolicy.assertCanView(viewerUserId);

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
   
  try {
  await this.audit.createLog({
    userId: viewerUserId,
    action: 'notification.view_list',
    success: true,
    metadata: {
      cursor,
      limit,
    },
  });
} catch {}

    await this.cache.set(viewerUserId, cursor, response);

    return response;
  }

  async markNotificationRead(params: {
    notificationId: string;
    viewerUserId: string;
  }) {
    const { notificationId, viewerUserId } = params;

    const notification = await this.repo.findByIdForOwnerCheck(notificationId);
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

    try {
  await this.audit.createLog({
    userId: viewerUserId,
    action: 'notification.read',
    success: true,
    targetId: notificationId,
  });
} catch {}

    await this.cache.invalidateList(viewerUserId);

    return { success: true };
  }

  /**
   * =========================
   * CREATE NOTIFICATION
   * รองรับทุก type ใน NotificationPayloadMap
   * รวมถึง:
   * - comment
   * - like
   * - follow
   * - comment_mention ✅
   * =========================
   */
  async createNotification<
  T extends keyof NotificationPayloadMap,
>(params: NotificationCreateInput<T>) {
  const {
    userId,
    actorUserId,
    type,
    entityId,
    payload,
  } = params;

  // 🔐 defensive: ไม่แจ้งเตือนตัวเอง
  if (userId === actorUserId) return null;

  // ✅ BLOCK CHECK (CRITICAL)
  const blocked = await this.prisma.userBlock.findFirst({
    where: {
      OR: [
        // recipient blocked actor
        {
          blockerId: userId,
          blockedId: actorUserId,
        },

        // actor blocked recipient
        {
          blockerId: actorUserId,
          blockedId: userId,
        },
      ],
    },
    select: { blockerId: true },
  });

  if (blocked) return null;

  // 1️⃣ Persist (DB = authority)
  const row = await this.repo.create({
    userId,
    actorUserId,
    type,
    entityId,
    payload,
  });

  try {
    await this.audit.createLog({
      userId: actorUserId ?? null, // system allowed
      action: 'notification.create',
      success: true,
      targetId: row.id,
      metadata: {
        type,
        entityId,
        recipient: userId,
      },
    });
  } catch {
    // fail-soft
  }

  const dto = NotificationMapper.toDto(row);

  // 2️⃣ Realtime emit (fail-soft)
  try {
    this.realtime.emitNewNotification(userId, {
      notification: dto,
    });
  } catch {
    /**
     * realtime fail ต้องไม่ทำให้ notification หลัก fail
     */
  }

  // ✅ IMPORTANT: return dto for callers that need it (non-breaking)
  return dto;
}


}
