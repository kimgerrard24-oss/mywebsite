// backend/src/securities/security.service.ts

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { SecurityRepository } from './security.repository';
import { AccountLockPolicy } from './policies/account-lock.policy';
import { RevokeUserSessionsService } from '../auth/services/revoke-user-sessions.service';
import { AuditLogService } from '../users/audit/audit-log.service';
import { PrismaService } from '../prisma/prisma.service';
import { CredentialVerificationService } from '../auth/credential-verification.service';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    private readonly repo: SecurityRepository,
    private readonly prisma: PrismaService,
    private readonly revokeUserSessions: RevokeUserSessionsService,
    private readonly auditLog: AuditLogService,
    private readonly credentialVerify: CredentialVerificationService,
  ) {}

  /**
   * Lock account using verified session (Option A).
   *
   * Flow:
   * 1) user verifies credential -> session marked verified in Redis
   * 2) this endpoint checks verified session
   * 3) lock account in DB (transaction)
   * 4) revoke all Redis sessions (best-effort)
   *
   * Authority:
   * - DB = source of truth for account lock
   * - Redis = authority for verified sensitive session
   */
  async lockMyAccount(params: {
    userId: string;
    jti: string;
    meta?: { ip?: string; userAgent?: string };
  }) {
    // =================================================
    // 1) Load user (DB authority)
    // =================================================
    const user = await this.repo.findUserForAccountLock(
      params.userId,
    );

    if (!user) {
      // should never happen if guard is correct
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    // =================================================
    // 2) Business policy
    // =================================================
    AccountLockPolicy.assertCanLock({
      isAccountLocked: user.isAccountLocked,
      isDisabled: user.isDisabled,
      isBanned: user.isBanned,
    });

    // =================================================
// 3) Verify & CONSUME sensitive-action session (Redis authority)
// =================================================
const isVerified =
  await this.credentialVerify.consumeVerifiedSession({
    jti: params.jti,
    scope: 'ACCOUNT_LOCK',
  });

if (!isVerified) {
  throw new ForbiddenException(
    'Sensitive verification required',
  );
}


    // =================================================
    // 4) Atomic domain mutation (DB transaction)
    // =================================================
    await this.prisma.$transaction(async (tx) => {
      await this.repo.lockAccountTx(tx, params.userId);

      await this.repo.createSecurityEventTx(tx, {
        userId: params.userId,
        ip: params.meta?.ip,
        userAgent: params.meta?.userAgent,
      });
    });

    // =================================================
    // 5) Revoke Redis sessions (best-effort, infra)
    // =================================================
    try {
      await this.revokeUserSessions.revokeAll(
        params.userId,
      );
    } catch (err) {
      // must never rollback DB state
      this.logger.error(
        '[REVOKE_SESSIONS_FAILED]',
        err instanceof Error ? err.stack : err,
      );
    }

    // =================================================
    // 6) Compliance audit (fire-and-forget)
    // =================================================
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
