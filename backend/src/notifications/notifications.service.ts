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

  // 🛡️ Payload validation by type (defensive, production-safe)
  switch (type) {
    case 'moderation_action': {
      const p = payload as any;
      if (!p?.actionType || !p?.targetType || !p?.targetId) {
        throw new Error(
          'Invalid payload for moderation_action notification',
        );
      }
      break;
    }

    case 'appeal_resolved': {
      const p = payload as any;
      if (!p?.appealId || !p?.decision) {
        throw new Error(
          'Invalid payload for appeal_resolved notification',
        );
      }
      break;
    }

    default:
      // legacy types — no extra validation
      break;
  }

  // ✅ BLOCK CHECK (CRITICAL) — only when actor exists
  if (actorUserId) {
    const blocked =
      await this.prisma.userBlock.findFirst({
        where: {
          OR: [
            {
              blockerId: userId,
              blockedId: actorUserId,
            },
            {
              blockerId: actorUserId,
              blockedId: userId,
            },
          ],
        },
        select: { blockerId: true },
      });

    if (blocked) return null;
  }

  // 1️⃣ Persist (DB = authority)
  const row = await this.repo.create({
    userId,
    actorUserId,
    type,
    entityId,
    payload,
  });

  // 1.5️⃣ Audit (fail-soft)
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
  } catch {}

  const dto = NotificationMapper.toDto(row);

  // 2️⃣ Realtime emit (fail-soft)
  try {
    this.realtime.emitNewNotification(userId, {
      notification: dto,
    });
  } catch {}

  // ✅ IMPORTANT: invalidate cache so next fetch is fresh
  await this.cache.invalidateList(userId);

  // ✅ return dto for callers (admin / appeal flows)
  return dto;
}


// =========================
// FOLLOW APPROVED
// =========================
async createFollowApproved(params: {
  userId: string;        
  actorUserId: string;  
}) {
  return this.createNotification({
    userId: params.userId,
    actorUserId: params.actorUserId,
    type: 'follow_request_approved',   
    entityId: params.actorUserId,  
    payload: {},                   
  });
}


// =========================
// FOLLOW REQUEST RECEIVED
// =========================
async createFollowRequest(params: {
  userId: string;        // target (คนที่ถูกขอ follow)
  actorUserId: string;  // requester
  followRequestId: string;
}) {
  return this.createNotification({
    userId: params.userId,
    actorUserId: params.actorUserId,
    type: 'follow_request',
    entityId: params.followRequestId,
    payload: {
      requesterId: params.actorUserId,
    },
  });
}

// =========================
// FEED: NEW POST FROM FOLLOWING
// =========================
async createFeedNewPost(params: {
  userId: string;        // follower
  actorUserId: string;  // author
  postId: string;
}) {
  return this.createNotification({
    userId: params.userId,
    actorUserId: params.actorUserId,
    type: 'feed_new_post',
    entityId: params.postId,
    payload: {
      postId: params.postId,
      authorId: params.actorUserId,
    },
  });
}

async createFeedBatch(
  inputs: Array<{
    userId: string;
    actorUserId: string;
    type: 'feed_new_post';
    entityId: string;
    payload: {
      postId: string;
      authorId: string;
    };
  }>,
) {
  if (!inputs.length) return;

  // defensive: remove self-notify
  const filtered = inputs.filter(
    (i) => i.userId !== i.actorUserId,
  );

  if (!filtered.length) return;

  // 1) DB bulk insert
  await this.prisma.notification.createMany({
    data: filtered.map((i) => ({
      userId: i.userId,
      actorUserId: i.actorUserId,
      type: i.type,
      entityId: i.entityId,
      payload: i.payload,
    })),
    skipDuplicates: true,
  });

  // 2) cache invalidate per user
  await Promise.allSettled(
    filtered.map((i) =>
      this.cache.invalidateList(i.userId),
    ),
  );

  // 3) realtime emit
  for (const i of filtered) {
    try {
      this.realtime.emitNewNotification(
        i.userId,
        {
          notification: {
            id: 'realtime', // client not rely on id
            type: i.type,
            actor: null,
            entityId: i.entityId,
            payload: i.payload,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        },
      );
    } catch {}
  }
}

}
