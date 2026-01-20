// backend/src/users/privacy/users-privacy.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePrivacyPolicy } from './policies/update-privacy.policy';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class UsersPrivacyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async updateMyPrivacy(params: {
    userId: string;
    isPrivate: boolean;
    ip?: string;
    userAgent?: string;
  }) {
    const { userId, isPrivate, ip, userAgent } = params;

    // =================================================
    // 1) Load user (DB authority)
    // =================================================
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isPrivate: true,
        isDisabled: true,
        isBanned: true,
        isAccountLocked: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // =================================================
    // 2) Policy
    // =================================================
    UpdatePrivacyPolicy.assertCanUpdate({
      isDisabled: user.isDisabled,
      isBanned: user.isBanned,
      isAccountLocked: user.isAccountLocked,
    });

    // =================================================
    // 3) No-op protection
    // =================================================
    if (user.isPrivate === isPrivate) {
      return { isPrivate: user.isPrivate };
    }

    // =================================================
    // 4) Update DB (authority)
    // =================================================
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isPrivate },
      select: {
        id: true,
        isPrivate: true,
      },
    });

    // =================================================
    // 5) Audit log (security / compliance)
    // =================================================
    await this.auditLog.log({
      userId,
      action: 'user.privacy.update',
      success: true,
      targetId: userId,
      ip,
      userAgent,
      metadata: { isPrivate },
    });

    // =================================================
    // 6) No Redis / No Socket
    // privacy does not affect session or realtime state
    // =================================================

    return updated;
  }
}
