// backend/src/reposts/listeners/post-reposted.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PostRepostedListener {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * =====================================================
   * 🔔 POST REPOSTED
   * - notify original post author
   * - fail-soft (must never break repost flow)
   * =====================================================
   */
@OnEvent('post.reposted', { async: true })
async handlePostReposted(event: {
  postId: string;
  repostId: string;
  actorUserId: string;
  originalPostAuthorId: string;
  createdAt: Date;
}) {
  const {
    postId,
    actorUserId,
    originalPostAuthorId,
  } = event;

  // 🛡️ no self notify
  if (actorUserId === originalPostAuthorId) {
    return;
  }

  // 🛡️ ensure target exists (fail-soft)
  try {
    const exists = await this.prisma.user.findUnique({
      where: { id: originalPostAuthorId },
      select: { id: true },
    });
    if (!exists) return;
  } catch {
    return;
  }

  // 🔔 create notification
  try {
    await this.notifications.createNotification({
      userId: originalPostAuthorId,
      actorUserId,
      type: 'post_reposted',
      entityId: postId,
      payload: {
        postId, 
      },
    });
  } catch {
    // fail-soft
  }
}
}