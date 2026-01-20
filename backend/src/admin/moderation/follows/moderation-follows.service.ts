// backend/src/admin/moderation/follows/moderation-follows.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsersRepository } from '../../../users/users.repository';
import { NotificationsService } from '../../../notifications/notifications.service';
import { ModerationFollowsRepository } from './moderation-follows.repository';
import { ForceRemoveFollowPolicy } from './policy/force-remove-follow.policy';
import { ForceRemoveFollowAudit } from './audit/force-remove-follow.audit';

import {
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';

@Injectable()
export class ModerationFollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepo: UsersRepository,
    private readonly repo: ModerationFollowsRepository,
    private readonly notifications: NotificationsService,
    private readonly audit: ForceRemoveFollowAudit,
  ) {}

 async forceRemove(params: {
  adminId: string;
  followId: string; // format: followerId:followingId
  reason: string;
  note?: string;
}) {
  // ============================
  // 1) Load admin (DB authority)
  // ============================
  const admin =
    await this.usersRepo.findUserForPolicyCheck(
      params.adminId,
    );

  if (!admin) {
    throw new NotFoundException('Admin not found');
  }

  ForceRemoveFollowPolicy.assertAllowed({
    isAdminDisabled: admin.isDisabled,
    isAdminBanned: admin.isBanned,
    isAdminLocked: admin.isAccountLocked,
  });

  // ============================
  // 2) Parse follow composite id
  // ============================
  const [followerId, followingId] =
    params.followId.split(':');

  if (!followerId || !followingId) {
    throw new BadRequestException(
      'Invalid follow id format',
    );
  }

  // ============================
  // 3) Load follow (DB authority)
  // ============================
  const follow = await this.repo.findFollow({
    followerId,
    followingId,
  });

  if (!follow) {
    throw new NotFoundException('Follow not found');
  }

  const compositeFollowId = `${followerId}:${followingId}`;

  // ============================
  // 4) Transaction (authority)
  // ============================
  await this.prisma.$transaction(async (tx) => {
    // delete follow relation
    await tx.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    // record moderation action
    await tx.moderationAction.create({
      data: {
        adminId: params.adminId,
        actionType: ModerationActionType.DELETE,
        targetType: ModerationTargetType.FOLLOW,
        targetId: compositeFollowId,
        reason: params.reason,
      },
    });
  });

  // ============================
  // 5) Notification (fail-soft)
  // ============================
  try {
    await this.notifications.createNotification({
      userId: followerId, // notify follower
      actorUserId: params.adminId,
      type: 'moderation_action',
      entityId: compositeFollowId,
      payload: {
        actionType: ModerationActionType.DELETE,
        targetType: ModerationTargetType.FOLLOW,
        targetId: compositeFollowId,
        reason: params.reason,
      },
    });
  } catch {
    // fail-soft (do not affect authority result)
  }

  // ============================
  // 6) Audit (fail-soft)
  // ============================
  try {
    await this.audit.record({
      adminId: params.adminId,
      followerId,
      followingId,
      reason: params.reason,
    });
  } catch {
    // fail-soft
  }
}

}


