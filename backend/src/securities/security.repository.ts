// backend/src/securities/security.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityEventType, VerificationType } from '@prisma/client';

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

  async createSecurityEvent(params: {
    userId: string;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.securityEvent.create({
      data: {
        userId: params.userId,
        type: SecurityEventType.ACCOUNT_LOCKED,
        ip: params.ip,
        userAgent: params.userAgent,
      },
    });
  }
}
