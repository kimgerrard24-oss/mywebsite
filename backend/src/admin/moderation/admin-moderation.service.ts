// backend/src/admin/moderation/admin-moderation.service.ts

import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { AdminModerationRepository } from './admin-moderation.repository';
import { AdminModerationPolicy } from './policy/admin-moderation.policy';
import { CreateModerationActionDto } from './dto/create-moderation-action.dto';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { ModerationActionType } from '@prisma/client';
import { AuditService } from '../../auth/audit.service'
import { NotificationsService } from '../../notifications/notifications.service'
import { RedisService } from '../../redis/redis.service'

@Injectable()
export class AdminModerationService {
  constructor(
    private readonly repo: AdminModerationRepository,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly redis: RedisService,
  ) {}

  async createAction(
  adminId: string,
  dto: CreateModerationActionDto,
): Promise<ModerationActionDto> {

  /**
   * 1️⃣ Policy (business authority)
   */
  try {
    AdminModerationPolicy.assertAllowed(adminId, dto);
  } catch (err) {
    try {
      await this.audit.logAdminAction({
        adminId,
        action: dto.actionType,
        targetId: dto.targetId,
        reason: dto.reason,
        metadata: {
          targetType: dto.targetType,
          blocked: 'policy',
        },
      });
    } catch {}
    throw err;
  }

  /**
   * 2️⃣ Validate target existence
   */
  try {
    await this.repo.assertTargetExists(
      dto.targetType,
      dto.targetId,
    );
  } catch (err) {
    try {
      await this.audit.logAdminAction({
        adminId,
        action: dto.actionType,
        targetId: dto.targetId,
        reason: dto.reason,
        metadata: {
          targetType: dto.targetType,
          blocked: 'target_not_found',
        },
      });
    } catch {}
    throw err;
  }

  /**
   * 2.5️⃣ Validate UNHIDE is allowed (state check)
   */
  if (dto.actionType === ModerationActionType.UNHIDE) {
    const canUnhide =
      await this.repo.canUnhideTarget(
        dto.targetType,
        dto.targetId,
      );

    if (!canUnhide) {
      try {
        await this.audit.logAdminAction({
          adminId,
          action: dto.actionType,
          targetId: dto.targetId,
          reason: dto.reason,
          metadata: {
            targetType: dto.targetType,
            blocked: 'invalid_state',
          },
        });
      } catch {}

      throw new BadRequestException(
        'Target cannot be unhidden',
      );
    }
  }

  if (
  dto.targetType === 'POST' &&
  (dto.actionType === ModerationActionType.POST_FORCE_PUBLIC ||
   dto.actionType === ModerationActionType.POST_FORCE_PRIVATE)
) {
  const canOverride =
    await this.repo.canOverridePostVisibility(dto.targetId);

  if (!canOverride) {
    try {
      await this.audit.logAdminAction({
        adminId,
        action: dto.actionType,
        targetId: dto.targetId,
        reason: dto.reason,
        metadata: {
          targetType: dto.targetType,
          blocked: 'invalid_visibility_state',
        },
      });
    } catch {}

    throw new BadRequestException(
      'Post visibility cannot be overridden in current state',
    );
  }
}

  /**
   * 3️⃣ Create moderation action (DB)
   */
  const action =
    await this.repo.createModerationAction({
      adminId,
      ...dto,
    });

 /**
 * 4️⃣ Apply side-effect (DB authority)
 * - hide/unhide
 * - ban user
 * - override post visibility
 */
  await this.repo.applyActionEffect(
    dto.targetType,
    dto.targetId,
    dto.actionType,
  );

   /**
   * 4.2️⃣ Revoke all sessions if BAN_USER (security critical)
   * fail-soft: ห้ามทำให้ moderation fail
   */
  if (dto.actionType === ModerationActionType.BAN_USER) {
    try {
      await this.redis.revokeAllSessionsByUser(dto.targetId);
    } catch {
      // fail-soft
    }
  }
   
  /**
 * 4.5️⃣ Notify affected user (best-effort)
 */
try {
  const targetUserId =
    await this.repo.resolveTargetOwnerUserId(
      dto.targetType,
      dto.targetId,
    );

  if (targetUserId) {
    await this.notifications.createNotification({
      userId: targetUserId,
      actorUserId: adminId, // admin เป็น actor
      type: 'moderation_action',
      entityId: dto.targetId,
      payload: {
        actionType: dto.actionType,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
      },
    });
  }
} catch {
  // fail-soft: notification ล้มเหลวห้ามทำให้ moderation fail
}

  /**
   * 5️⃣ Mark related report as ACTION_TAKEN
   */
  if (
    dto.actionType === ModerationActionType.HIDE ||
    dto.actionType === ModerationActionType.UNHIDE ||
    dto.actionType === ModerationActionType.BAN_USER
    
    || dto.actionType === ModerationActionType.POST_FORCE_PUBLIC
    || dto.actionType === ModerationActionType.POST_FORCE_PRIVATE

  ) {
    await this.repo.markReportActionTaken({
      targetType: dto.targetType,
      targetId: dto.targetId,
      adminId,
      reason: dto.reason,
    });
  }

  /**
   * 6️⃣ ✅ AUDIT LOG — SUCCESS ONLY
   */
  try {
    await this.audit.logAdminAction({
      adminId,
      action: dto.actionType,
      targetId: dto.targetId,
      reason: dto.reason,
      metadata: {
        targetType: dto.targetType,
        success: true,
      },
    });
  } catch {}

  return {
    id: action.id,
    actionType: action.actionType,
    targetType: action.targetType,
    targetId: action.targetId,
    reason: action.reason,
    createdAt: action.createdAt,
  };
}
}
