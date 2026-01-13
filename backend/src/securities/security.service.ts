// backend/src/securities/security.service.ts

import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { SecurityRepository } from './security.repository';
import { AccountLockPolicy } from './policies/account-lock.policy';
import { RevokeUserSessionsService } from'../auth/services/revoke-user-sessions.service';
import { AuditLogService } from '../users/audit/audit-log.service';

@Injectable()
export class SecurityService {
  constructor(
    private readonly repo: SecurityRepository,
    private readonly revokeUserSessions: RevokeUserSessionsService,
    private readonly auditLog: AuditLogService,
  ) {}

  async lockMyAccount(params: {
    userId: string;
    credentialTokenHash: string;
    meta?: { ip?: string; userAgent?: string };
  }) {
    const user = await this.repo.findUserForAccountLock(params.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    AccountLockPolicy.assertCanLock({
      isAccountLocked: user.isAccountLocked,
      isDisabled: user.isDisabled,
      isBanned: user.isBanned,
    });

    const token = await this.repo.consumeSensitiveActionToken({
      userId: params.userId,
      tokenHash: params.credentialTokenHash,
    });

    if (!token) {
      throw new BadRequestException('Invalid or expired credential token');
    }

    await this.repo.lockAccount(params.userId);

    /** 🔥 Authority: revoke Redis sessions */
    await this.revokeUserSessions.revokeAll(params.userId);

    /** Security event */
    await this.repo.createSecurityEvent({
      userId: params.userId,
      ip: params.meta?.ip,
      userAgent: params.meta?.userAgent,
    });

    /** Audit (fire-and-forget safe) */
    try {
      await this.auditLog.log({
        userId: params.userId,
        action: 'USER_SELF_LOCK_ACCOUNT',
        success: true,
      });
    } catch {}

    return { success: true };
  }
}
