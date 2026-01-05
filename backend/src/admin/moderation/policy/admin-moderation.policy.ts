// backend/src/admin/moderation/policy/admin-moderation.policy.ts

import { ForbiddenException } from '@nestjs/common';
import { CreateModerationActionDto } from '../dto/create-moderation-action.dto';

export class AdminModerationPolicy {
  static assertAllowed(
    adminId: string,
    dto: CreateModerationActionDto,
  ) {
    // ❌ admin ห้าม action ตัวเอง
    if (
      dto.targetType === 'USER' &&
      dto.targetId === adminId
    ) {
      throw new ForbiddenException(
        'Admin cannot moderate self',
      );
    }

    // future:
    // - super admin only
    // - irreversible action gate
    return true;
  }
}
