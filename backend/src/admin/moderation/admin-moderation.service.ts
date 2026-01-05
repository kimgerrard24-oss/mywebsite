// backend/src/admin/moderation/admin-moderation.service.ts

import { Injectable } from '@nestjs/common';
import { AdminModerationRepository } from './admin-moderation.repository';
import { AdminModerationPolicy } from './policy/admin-moderation.policy';
import { CreateModerationActionDto } from './dto/create-moderation-action.dto';
import { ModerationActionDto } from './dto/moderation-action.dto';

@Injectable()
export class AdminModerationService {
  constructor(
    private readonly repo: AdminModerationRepository,
  ) {}

  async createAction(
    adminId: string,
    dto: CreateModerationActionDto,
  ): Promise<ModerationActionDto> {
    // 1️⃣ policy (business authority)
    AdminModerationPolicy.assertAllowed(
      adminId,
      dto,
    );

    // 2️⃣ validate target existence
    await this.repo.assertTargetExists(
      dto.targetType,
      dto.targetId,
    );

    // 3️⃣ create audit log
    const action =
      await this.repo.createModerationAction({
        adminId,
        ...dto,
      });

    // 4️⃣ apply side-effect
    await this.repo.applyActionEffect(
      dto.targetType,
      dto.targetId,
      dto.actionType,
    );

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
