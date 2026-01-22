// backend/src/users/privacy/users-privacy.service.ts

import { 
  Injectable, 
  BadRequestException,
  NotFoundException,
 } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePrivacyPolicy } from './policies/update-privacy.policy';
import { AuditLogService } from '../audit/audit-log.service';
import { PrivacyRepository } from './privacy.repository';
import { PostPrivacyPolicy } from './policies/post-privacy.policy';
import { PostPrivacyAudit } from './audit/post-privacy.audit';
import { FeedCacheService } from '../../feed/cache/feed-cache.service';
import { PostPrivacyChangedEvent } from './events/post-privacy-changed.event';

@Injectable()
export class UsersPrivacyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly repo: PrivacyRepository,
    private readonly audit: PostPrivacyAudit,
    private readonly feedCache: FeedCacheService,
    private readonly event: PostPrivacyChangedEvent,
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

  async updateMyPostPrivacy(params: {
    userId: string;
    isPrivate: boolean;
    ip?: string;
    userAgent?: string;
  }) {
    // ===============================
    // 1) Load user (DB authority)
    // ===============================
    const user = await this.repo.findUserForPrivacyUpdate(params.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ===============================
    // 2) Policy
    // ===============================
    PostPrivacyPolicy.assertCanChange({
      isDisabled: user.isDisabled,
      isBanned: user.isBanned,
      isAccountLocked: user.isAccountLocked,
    });

    // no-op guard
    if (user.isPrivate === params.isPrivate) {
      return {
        success: true,
        isPrivate: user.isPrivate,
      };
    }

    // ===============================
    // 3) Update DB (authority)
    // ===============================
    const updated = await this.repo.updatePostPrivacy(
      params.userId,
      params.isPrivate,
    );

    // ===============================
    // 4) Audit (fail-soft)
    // ===============================
    await this.audit.logChanged({
      userId: params.userId,
      from: user.isPrivate,
      to: params.isPrivate,
      ip: params.ip,
      userAgent: params.userAgent,
    });

    // ===============================
    // 5) Cache invalidate (best-effort)
    // ===============================
    try {
      await this.feedCache.invalidateByUser(params.userId);
    } catch {}

    // ===============================
    // 6) Event (future realtime)
    // ===============================
    try {
      this.event.emit({
        userId: params.userId,
        isPrivate: params.isPrivate,
      });
    } catch {}

    return {
      success: true,
      isPrivate: updated.isPrivate,
    };
  }
}
