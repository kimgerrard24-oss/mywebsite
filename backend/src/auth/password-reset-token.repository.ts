// file: src/auth/password-reset-token.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { PasswordResetToken } from '@prisma/client';

@Injectable()
export class PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async invalidateTokensForUser(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId,
      },
    });
  }

  async createToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    const { userId, tokenHash, expiresAt } = params;

    return this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  // ใช้ตอนตรวจ token ก่อน reset password
  async findValidTokenByUserId(
    userId: string,
  ): Promise<PasswordResetToken | null> {
    const now = new Date();
    return this.prisma.passwordResetToken.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // เพิ่มให้ใช้ตาม production code ที่คุณขอ
  async findLatestActiveTokenForUser(
    userId: string,
  ): Promise<PasswordResetToken | null> {
    const now = new Date();

    return this.prisma.passwordResetToken.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // mark token ว่าใช้แล้ว
  async markTokenUsed(id: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  }

  // ลบ token ที่หมดอายุ
  async deleteExpiredTokensForUser(userId: string): Promise<void> {
    const now = new Date();

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: now,
        },
      },
    });
  }
}
