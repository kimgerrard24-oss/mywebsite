// backend/src/follows/follow-request/follow-requests.service.ts

import { 
  Injectable,
  NotFoundException,
  ForbiddenException, 
} from '@nestjs/common';
import { FollowRequestsRepository } from './follow-requests.repository';
import { FollowRequestCreatePolicy } from './policy/follow-request-create.policy';
import { FollowRequestAudit } from './audit/follow-request.audit';
import { NotificationsService } from '../../notifications/notifications.service';
import { SecurityEventType } from '@prisma/client';
import { AuditLogService } from '../../users/audit/audit-log.service';
import { UsersRepository } from '../../users/users.repository';
import { CancelFollowRequestPolicy } from './policy/cancel-follow-request.policy';
import { ViewIncomingFollowRequestsPolicy } from '../policy/view-incoming-follow-requests.policy';
import { IncomingFollowRequestDto } from './dto/incoming-follow-request.dto';
import { ApproveFollowRequestPolicy } from './policy/approve-follow-request.policy';
import { PrismaService } from '../../prisma/prisma.service';
import { RejectFollowRequestPolicy } from './policy/reject-follow-request.policy';

@Injectable()
export class FollowRequestsService {
  constructor(
    private readonly repo: FollowRequestsRepository,
    private readonly audit: FollowRequestAudit,
    private readonly notifications: NotificationsService,
    private readonly usersRepo: UsersRepository,
    private readonly auditLog: AuditLogService,
    private readonly prisma: PrismaService, 
  ) {}

  async createRequest(params: {
  requesterId: string;
  targetUserId: string;
  jti: string;
}): Promise<void> {
  const isSelf =
    params.requesterId === params.targetUserId;

  const isBlocked = await this.repo.isBlockedBetween({
    userA: params.requesterId,
    userB: params.targetUserId,
  });

  const alreadyFollowing = await this.repo.isFollowing({
    followerId: params.requesterId,
    followingId: params.targetUserId,
  });

  const alreadyRequested = await this.repo.exists({
    requesterId: params.requesterId,
    targetUserId: params.targetUserId,
  });

  FollowRequestCreatePolicy.assertCanCreate({
    isSelf,
    isBlocked,
    alreadyFollowing,
    alreadyRequested,
  });

  // ===============================
  // 1) DB authority — create follow request
  // ===============================
  const request = await this.repo.create({
    requesterId: params.requesterId,
    targetUserId: params.targetUserId,
  });

  // ===============================
  // 2) Notification (DB + realtime)
  // ===============================
  try {
    await this.notifications.createFollowRequest({
      userId: params.targetUserId,
      actorUserId: params.requesterId,
      followRequestId: request.id,
    });
  } catch {}

  // ===============================
  // 3) Audit
  // ===============================
  await this.audit.recordCreate({
    requesterId: params.requesterId,
    targetUserId: params.targetUserId,
  });
}



   // =========================================
  // Cancel follow request (authority logic)
  // =========================================
  async cancelRequest(params: {
    requesterId: string;
    targetUserId: string;
    jti: string;
  }): Promise<void> {
    const { requesterId, targetUserId } = params;

    // =================================================
    // 1) Load requester security state (DB authority)
    // =================================================
    const requester =
      await this.usersRepo.findUserForPolicyCheck(
        requesterId,
      );

    if (!requester) {
      throw new NotFoundException('User not found');
    }

    CancelFollowRequestPolicy.assertCanCancel({
      isAccountLocked: requester.isAccountLocked,
      isBanned: requester.isBanned,
      isDisabled: requester.isDisabled,
    });

    // =================================================
    // 2) Load follow request
    // =================================================
    const request =
      await this.repo.findByRequesterAndTarget({
        requesterId,
        targetUserId,
      });

    if (!request) {
      throw new NotFoundException(
        'Follow request not found',
      );
    }

    // =================================================
    // 3) Delete follow request (DB authority)
    // =================================================
    await this.repo.deleteById(request.id);

    // =================================================
    // 4) Audit log
    // =================================================
    await this.auditLog.log({
      userId: requesterId,
      action: 'follow_request.cancel',
      success: true,
      targetId: targetUserId,
      metadata: {
        followRequestId: request.id,
      },
    });

    // =================================================
    // 5) Security event (optional but production-grade)
    // =================================================
    await this.auditLog.logSecurityEvent({
      userId: requesterId,
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      metadata: {
        action: 'cancel_follow_request',
        targetUserId,
      },
    });
  }

   // =================================================
  // GET incoming follow requests (authority)
  // =================================================
  async getIncomingRequests(params: {
    targetUserId: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = params.limit ?? 20;

    // =================================================
    // 1) Policy check (DB authority)
    // =================================================
    const user =
      await this.usersRepo.findUserForPolicyCheck(
        params.targetUserId,
      );

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    ViewIncomingFollowRequestsPolicy.assertAllowed(
      {
        isDisabled: user.isDisabled,
        isBanned: user.isBanned,
        isAccountLocked: user.isAccountLocked,
      },
    );

    // =================================================
    // 2) Load follow requests
    // =================================================
    const rows = await this.repo.findIncoming({
      targetUserId: params.targetUserId,
      cursor: params.cursor,
      limit,
    });

    const hasNext = rows.length > limit;
    const items = hasNext
      ? rows.slice(0, limit)
      : rows;

    const nextCursor = hasNext
      ? items[items.length - 1].id
      : null;

    // =================================================
    // 3) Audit (read sensitive social data)
    // =================================================
    await this.auditLog.log({
      userId: params.targetUserId,
      action: 'follow_request.view_incoming',
      success: true,
      metadata: {
        count: items.length,
      },
    });

    // =================================================
    // 4) Map to public DTO
    // =================================================
    return {
      items: items.map((r) =>
        IncomingFollowRequestDto.fromEntity(
          r,
        ),
      ),
      nextCursor,
    };
  }

  async approveRequest(params: {
    requestId: string;
    actorUserId: string;
    jti: string;
  }): Promise<void> {
    const req =
      await this.repo.findByIdForApprove(
        params.requestId,
      );

    if (!req) {
      throw new NotFoundException(
        'Follow request not found',
      );
    }

    if (req.target.id !== params.actorUserId) {
      throw new ForbiddenException();
    }

    ApproveFollowRequestPolicy.assertAllowed(
      req.target,
    );

    const { requesterId } = req;

    // ===============================
    // DB transaction (authority)
    // ===============================
    await this.prisma.$transaction(
      async (tx) => {
        await tx.followRequest.delete({
          where: { id: req.id },
        });

        await tx.follow.upsert({
          where: {
            followerId_followingId: {
              followerId: requesterId,
              followingId: params.actorUserId,
            },
          },
          create: {
            followerId: requesterId,
            followingId: params.actorUserId,
          },
          update: {},
        });
      },
    );

   // ===============================
// Notification (DB → Realtime inside service)
// ===============================
await this.notifications.createFollowApproved({
  userId: requesterId,
  actorUserId: params.actorUserId,
});


    // ===============================
    // Audit
    // ===============================
    await this.audit.approved({
      actorUserId: params.actorUserId,
      requesterId,
    });
  }

   // =========================================
  // Reject follow request (authority)
  // =========================================
  async rejectRequest(params: {
    requestId: string;
    actorUserId: string;
    jti: string;
  }): Promise<void> {
    // =========================================
    // 1) Load follow request + target user
    // =========================================
    const req =
      await this.repo.findByIdForReject(params.requestId);

    if (!req) {
      throw new NotFoundException(
        'Follow request not found',
      );
    }

    if (req.targetUserId !== params.actorUserId) {
      throw new ForbiddenException();
    }

    // =========================================
    // 2) Policy check (DB authority)
    // =========================================
    RejectFollowRequestPolicy.assertAllowed({
      isAccountLocked: req.target.isAccountLocked,
      isBanned: req.target.isBanned,
      isDisabled: req.target.isDisabled,
    });

    // =========================================
    // 3) Delete follow request (DB authority)
    // =========================================
    await this.repo.deleteById(req.id);

    // =========================================
    // 4) Audit (domain semantic)
    // =========================================
    await this.audit.rejected({
      actorUserId: params.actorUserId,
      requesterId: req.requesterId,
    });

    // =========================================
    // 5) Security audit (optional, fail-soft)
    // =========================================
    try {
      await this.auditLog.log({
        userId: params.actorUserId,
        action: 'follow_request.reject',
        success: true,
        targetId: req.requesterId,
      });
    } catch {}
  }
}
