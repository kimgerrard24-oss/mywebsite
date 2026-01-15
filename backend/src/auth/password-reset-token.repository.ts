// file: src/auth/password-reset-token.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationType } from '@prisma/client';

@Injectable()
export class PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  // =================================================
  // Revoke previous active PASSWORD_RESET tokens
  // =================================================
  async revokeActiveTokensForUser(
    userId: string,
  ): Promise<void> {
    const now = new Date();

    await this.prisma.identityVerificationToken.updateMany({
      where: {
        userId,
        type: VerificationType.PASSWORD_RESET,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        usedAt: now,
      },
    });
  }

  // =================================================
  // Create new PASSWORD_RESET token
  // =================================================
  async createToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    const { userId, tokenHash, expiresAt } = params;

    return this.prisma.identityVerificationToken.create({
      data: {
        userId,
        type: VerificationType.PASSWORD_RESET,
        tokenHash,
        expiresAt,
      },
    });
  }

  // =================================================
  // Find latest active token
  // =================================================
  async findLatestActiveTokenForUser(
    userId: string,
  ) {
    const now = new Date();

    return this.prisma.identityVerificationToken.findFirst({
      where: {
        userId,
        type: VerificationType.PASSWORD_RESET,
        usedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =================================================
  // Atomic consume token (prevent reuse)
  // =================================================
  async consumeToken(tokenId: string): Promise<boolean> {
    const result =
      await this.prisma.identityVerificationToken.updateMany({
        where: {
          id: tokenId,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

    return result.count === 1;
  }

  // =================================================
  // Cleanup expired tokens (optional cron usage)
  // =================================================
  async deleteExpiredTokensForUser(
    userId: string,
  ): Promise<void> {
    const now = new Date();

    await this.prisma.identityVerificationToken.deleteMany({
      where: {
        userId,
        type: VerificationType.PASSWORD_RESET,
        expiresAt: { lt: now },
      },
    });
  }
}

