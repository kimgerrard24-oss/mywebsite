// backend/src/securities/security.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SecurityEventType, VerificationType } from '@prisma/client';

@Injectable()
export class SecurityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserForAccountLock(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isAccountLocked: true,
        isDisabled: true,
        isBanned: true,
      },
    });
  }

  // ⚠️ DO NOT use for account-lock flow (must be atomic)
  // @deprecated use consumeSensitiveActionTokenTx instead
  async consumeSensitiveActionToken(params: {
    userId: string;
    tokenHash: string;
  }) {
    const token = await this.prisma.identityVerificationToken.findFirst({
      where: {
        userId: params.userId,
        type: VerificationType.SENSITIVE_ACTION,
        tokenHash: params.tokenHash,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
    });

    if (!token) return null;

    await this.prisma.identityVerificationToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });

    return token;
  }

  // ⚠️ DO NOT use for account-lock flow (must be atomic)
  // @deprecated use lockAccountTx instead
  async lockAccount(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isAccountLocked: true,
        accountLockedAt: new Date(),
        accountLockReason: 'USER_SELF_LOCK',
      },
    });
  }

  // =================================================
  // ✅ TX — PRODUCTION AUTHORITY PATH
  // =================================================

  async consumeSensitiveActionTokenTx(
    tx: Prisma.TransactionClient,
    params: { userId: string; tokenHash: string },
  ) {
    const token =
      await tx.identityVerificationToken.findFirst({
        where: {
          userId: params.userId,
          type: VerificationType.SENSITIVE_ACTION,
          tokenHash: params.tokenHash,
          expiresAt: { gt: new Date() },
          usedAt: null,
        },
      });

    if (!token) return null;

    await tx.identityVerificationToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });

    return token;
  }

  async lockAccountTx(
    tx: Prisma.TransactionClient,
    userId: string,
  ) {
    return tx.user.update({
      where: { id: userId },
      data: {
        isAccountLocked: true,
        accountLockedAt: new Date(),
        accountLockReason: 'USER_SELF_LOCK',
      },
    });
  }

  async createSecurityEventTx(
    tx: Prisma.TransactionClient,
    params: { userId: string; ip?: string; userAgent?: string },
  ) {
    return tx.securityEvent.create({
      data: {
        userId: params.userId,
        type: SecurityEventType.ACCOUNT_LOCKED,
        ip: params.ip,
        userAgent: params.userAgent,
      },
    });
  }
}
