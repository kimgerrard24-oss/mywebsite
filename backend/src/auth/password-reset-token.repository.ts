// src/auth/password-reset-token.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // ถ้า path ต่าง ให้แก้นิดหน่อย
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

  // เผื่อไว้ใช้ตอนตรวจสอบ token ใน route reset จริง ๆ
  async findValidTokenByUserId(userId: string): Promise<PasswordResetToken | null> {
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
}
