// src/auth/password-reset.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordResetTokenRepository } from './password-reset-token.repository';
import { PasswordResetMailService } from '../mail/password-reset-mail.service';
import { generateSecureToken, hashToken } from '../common/security/secure-token.util';
import type { User } from '@prisma/client';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly tokenExpiresMinutes = 15;

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordResetTokenRepo: PasswordResetTokenRepository,
    private readonly passwordResetMailService: PasswordResetMailService,
  ) {}

  async requestPasswordReset(email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    let user: User | null = null;

    try {
      user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (error) {
      // ถ้า query พลาดให้ log ไว้ แต่ไม่ควรส่ง error detail ให้ client
      this.logger.error(`Error fetching user for password reset: ${error}`);
      return; // ทำตัวเหมือน success เพื่อไม่ให้บอกข้อมูลระบบ
    }

    // ถ้าไม่เจอ user -> ไม่ต้องทำอะไรต่อ แต่ตอบกลับแบบเดียวกับกรณีเจอ user
    if (!user) {
      this.logger.debug(
        `Password reset requested for non-existing email: ${normalizedEmail}`,
      );
      return;
    }

    // ล้าง token เก่าของ user นี้ (ถ้ามี)
    await this.passwordResetTokenRepo.invalidateTokensForUser(user.id);

    // สร้าง token ใหม่
    const rawToken = generateSecureToken(32); // 32 bytes -> 64 hex chars
    const tokenHash = await hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() + this.tokenExpiresMinutes * 60 * 1000,
    );

    await this.passwordResetTokenRepo.createToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // BASE URL ของ frontend สำหรับสร้างลิงก์ reset password
    const frontendBaseUrl =
      process.env.FRONTEND_URL ||
      process.env.PUBLIC_FRONTEND_URL ||
      'https://www.phlyphant.com';

    const resetUrl = `${frontendBaseUrl.replace(
      /\/$/,
      '',
    )}/auth/reset-password?token=${encodeURIComponent(
      rawToken,
    )}&email=${encodeURIComponent(normalizedEmail)}`;

    await this.passwordResetMailService.sendPasswordResetEmail(user.email, {
      resetUrl,
      expiresInMinutes: this.tokenExpiresMinutes,
      usernameOrEmail: user['name'] || user.email,
    });

    // Log สำหรับ security/audit (อย่า log token จริง / tokenHash)
    this.logger.log(
      `Password reset requested for userId=${user.id}, email=${user.email}, ip=${ipAddress}, userAgent=${userAgent}`,
    );
  }
}
