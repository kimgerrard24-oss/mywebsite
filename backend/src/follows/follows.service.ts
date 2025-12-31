// backend/src/follows/follows.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { FollowsRepository } from './follows.repository';
import { FollowCreatePolicy } from './policy/follow-create.policy';
import { FollowCacheService } from './cache/follow-cache.service';
import { FollowCreatedEvent } from './events/follow-created.event';
import { FollowAudit } from './audit/follow.audit';
import { UNFOLLOW_ERRORS } from './errors/unfollow.errors';
import { FollowDeletePolicy } from './policy/follow-delete.policy';
import { FollowersMapper } from './mappers/followers.mapper';
import { FollowersReadPolicy } from './policy/followers-read.policy';
import { FollowRemovedEvent } from './events/follow-removed.event';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationMapper } from '../notifications/mapper/notification.mapper';

@Injectable()
export class FollowsService {
  constructor(
    private readonly repo: FollowsRepository,
    private readonly cache: FollowCacheService,
    private readonly eventcreate: FollowCreatedEvent,
    private readonly eventremove: FollowRemovedEvent,
    private readonly audit: FollowAudit,
    private readonly notifications: NotificationsService,
  ) {}

 async follow(params: {
  followerId: string;
  followingId: string;
}): Promise<void> {
  FollowCreatePolicy.assertCanFollow(params);

  const exists = await this.repo.exists(params);
  if (exists) {
    throw new ConflictException('ALREADY_FOLLOWING');
  }

  await this.repo.createFollow(params);

  // 🔔 CREATE NOTIFICATION (fire-and-forget, fail-soft)
  if (params.followerId !== params.followingId) {
    try {
      await this.notifications.createNotification({
        userId: params.followingId,     // ผู้รับ
        actorUserId: params.followerId, // ผู้กระทำ
        type: 'follow',
        entityId: params.followerId,
        payload: {}, // follow ไม่มี payload เพิ่ม
      });
    } catch {
      // ❗ notification fail ต้องไม่กระทบ follow
    }
  }

  await this.cache.invalidateCounts([
    params.followerId,
    params.followingId,
  ]);

  await this.eventcreate.emit(params);
  await this.audit.record(params);
}

  async unfollow(params: {
    followerId: string;
    followingId: string;
  }): Promise<void> {
    FollowDeletePolicy.assertCanUnfollow(params);

    const exists = await this.repo.exists(params);
    if (!exists) {
      throw new ConflictException(UNFOLLOW_ERRORS.NOT_FOLLOWING);
    }

    await this.repo.deleteFollow(params);

    await this.cache.invalidateCounts([
      params.followerId,
      params.followingId,
    ]);

    await this.eventremove.emit(params);
    await this.audit.recordUnfollow(params);
  }

   async getFollowers(params: {
    userId: string;
    cursor?: string;
    limit?: number;
  }) {
    FollowersReadPolicy.assertCanReadFollowers({
      userId: params.userId,
    });

    const limit = params.limit ?? 20;

    const rows = await this.repo.findFollowers({
      userId: params.userId,
      cursor: params.cursor,
      limit,
    });

    return FollowersMapper.toResponse(rows, limit);
  }
}
