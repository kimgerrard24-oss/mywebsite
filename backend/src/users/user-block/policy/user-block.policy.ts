// backend/src/users/user-block/policy/user-block.policy.ts

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UserBlockPolicy {
  assertCanBlock(params: {
    blockerId: string;
    targetUserId: string;
    isTargetDisabled: boolean;
  }) {
    const { blockerId, targetUserId, isTargetDisabled } =
      params;

    if (blockerId === targetUserId) {
      throw new BadRequestException(
        'Cannot block yourself',
      );
    }

    if (isTargetDisabled) {
      throw new ForbiddenException(
        'Target user is disabled',
      );
    }
  }

   // ===== สำหรับ unblock =====
  assertCanUnblock(params: {
    blockerId: string;
    targetUserId: string;
  }) {
    const { blockerId, targetUserId } = params;

    if (blockerId === targetUserId) {
      throw new BadRequestException(
        'Cannot unblock yourself',
      );
    }
  }

  assertBlockExists(exists: boolean) {
    if (!exists) {
      throw new NotFoundException(
        'Block relation not found',
      );
    }
  }

  assertCanViewMyBlocks(params: {
    requesterId: string;
  }) {
    // ตอนนี้ไม่มี rule พิเศษ
    // แต่เก็บ policy layer ไว้สำหรับ:
    // - future privacy rules
    // - admin override
    return;
  }
}
