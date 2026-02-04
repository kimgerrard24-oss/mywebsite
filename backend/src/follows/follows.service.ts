// backend/src/follows/follows.service.ts
import { 
  Injectable, 
  ConflictException,
  NotFoundException,
 } from '@nestjs/common';
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

  // ==============================
  // 1) 🔒 BLOCK CHECK (2-way, fail-closed)
  // ==============================
  const blocked = await this.repo.isBlockedBetween({
    userA: params.followerId,
    userB: params.followingId,
  });

  if (blocked) {
    try {
      await this.audit.recordBlockedAttempt({
        followerId: params.followerId,
        followingId: params.followingId,
      });
    } catch {}

    throw new ConflictException('CANNOT_FOLLOW_USER');
  }

  // ==============================
  // 2) 🔒 TARGET PRIVACY CHECK (DB authority)
  // ==============================
  const targetPrivacy =
    await this.repo.getTargetPrivacy(params.followingId);

  if (!targetPrivacy) {
    // defensive: target not found
    throw new ConflictException('USER_NOT_FOUND');
  }

  // ❗ private account must use follow-request flow
  if (targetPrivacy.isPrivate) {
    throw new ConflictException('ACCOUNT_IS_PRIVATE');
  }

  // ==============================
  // 3) DUPLICATE FOLLOW CHECK
  // ==============================
  const exists = await this.repo.exists(params);
  if (exists) {
    try {
      await this.audit.recordDuplicateAttempt({
        followerId: params.followerId,
        followingId: params.followingId,
      });
    } catch {}

    throw new ConflictException('ALREADY_FOLLOWING');
  }

  // ==============================
  // 4) CREATE FOLLOW (DB authority)
  // ==============================
  await this.repo.createFollow(params);

  // ==============================
  // 5) 🔔 NOTIFICATION (fail-soft)
  // ==============================
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

  // ==============================
  // 6) CACHE INVALIDATE (counts only)
  // ==============================
  await this.cache.invalidateCounts([
    params.followerId,
    params.followingId,
  ]);

  // ==============================
  // 7) REALTIME EVENT (infra only)
  // ==============================
  await this.eventcreate.emit(params);

  // ==============================
  // 8) AUDIT LOG
  // ==============================
  await this.audit.record(params);
}


  async unfollow(params: {
    followerId: string;
    followingId: string;
  }): Promise<void> {
    FollowDeletePolicy.assertCanUnfollow(params);

    const exists = await this.repo.exists(params);
    if (!exists) {
  try {
    await this.audit.recordInvalidUnfollowAttempt({
      followerId: params.followerId,
      followingId: params.followingId,
    });
  } catch {}

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
  viewerUserId?: string | null;
  cursor?: string;
  limit?: number;
}) {
  const limit = params.limit ?? 20;

  // ==============================
  // 1) Load relation & privacy state
  // ==============================
  const relation = await this.repo.getFollowVisibilityState({
    targetUserId: params.userId,
    viewerUserId: params.viewerUserId ?? null,
  });

  if (!relation) {
    // target user not found → treat as forbidden
    throw new NotFoundException();
  }

  FollowersReadPolicy.assertCanReadFollowers({
    isPrivate: relation.isPrivate,
    isSelf: relation.isSelf,
    isFollowing: relation.isFollowing,
    isBlockedByTarget: relation.isBlockedByTarget,
    hasBlockedTarget: relation.hasBlockedTarget,
  });

  // ==============================
  // 2) Load followers list
  // ==============================
  const rows = await this.repo.findFollowers({
    userId: params.userId,
    viewerUserId: params.viewerUserId ?? null,
    cursor: params.cursor,
    limit,
  });

  return FollowersMapper.toResponse(rows, limit);
}

}
