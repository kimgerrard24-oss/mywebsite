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

@Injectable()
export class AdminModerationService {
  constructor(
    private readonly repo: AdminModerationRepository,
    private readonly audit: AuditService,
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

  /**
   * 3️⃣ Create moderation action (DB)
   */
  const action =
    await this.repo.createModerationAction({
      adminId,
      ...dto,
    });

  /**
   * 4️⃣ Apply side-effect
   */
  await this.repo.applyActionEffect(
    dto.targetType,
    dto.targetId,
    dto.actionType,
  );

  /**
   * 5️⃣ Mark related report as ACTION_TAKEN
   */
  if (
    dto.actionType === ModerationActionType.HIDE ||
    dto.actionType === ModerationActionType.UNHIDE ||
    dto.actionType === ModerationActionType.BAN_USER
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
