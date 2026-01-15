// file: src/auth/password-reset.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { generateSecureToken, hashToken } from '../common/security/secure-token.util';
import {
  PasswordResetPasswordMismatchException,
  PasswordResetTokenExpiredException,
  PasswordResetTokenInvalidException,
} from './password-reset.exceptions';
import { validatePasswordStrength } from './password-reset.policy';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerificationType } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly tokenExpiresMinutes = 15;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // ==================================================
  // REQUEST PASSWORD RESET
  // ==================================================
  async requestPasswordReset(
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    let user = null;

    try {
      user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (err) {
      this.logger.error(
        '[PASSWORD_RESET_FIND_USER_FAILED]',
        err,
      );
      return; // anti enumeration
    }

    // ❗ do not reveal whether user exists
    if (!user) return;

    // ==================================================
    // Revoke previous PASSWORD_RESET tokens
    // ==================================================
    try {
      await this.prisma.identityVerificationToken.updateMany({
        where: {
          userId: user.id,
          type: VerificationType.PASSWORD_RESET,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          usedAt: new Date(),
        },
      });
    } catch (err) {
      this.logger.error(
        '[PASSWORD_RESET_REVOKE_OLD_TOKEN_FAILED]',
        err,
      );
      return; // do not continue issuing token
    }

    // ==================================================
    // Generate token
    // ==================================================
    const rawToken = generateSecureToken(32);
    const tokenHash = await hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() + this.tokenExpiresMinutes * 60 * 1000,
    );

    await this.prisma.identityVerificationToken.create({
      data: {
        userId: user.id,
        type: VerificationType.PASSWORD_RESET,
        tokenHash,
        expiresAt,
      },
    });

    // ==================================================
    // Send email (Resend)
    // ==================================================
    const publicSiteUrl = process.env.PUBLIC_SITE_URL;

    if (!publicSiteUrl) {
      this.logger.error(
        '[PASSWORD_RESET] PUBLIC_SITE_URL not configured',
      );
      return;
    }

    const resetUrl =
      `${publicSiteUrl.replace(/\/$/, '')}/auth/reset-password` +
      `?token=${encodeURIComponent(rawToken)}` +
      `&email=${encodeURIComponent(normalizedEmail)}`;

    try {
      await this.mailService.sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        expiresInMinutes: this.tokenExpiresMinutes,
        usernameOrEmail: user.name || user.email,
      });
    } catch (err) {
      // MailService already logs technical error
      return; // never throw
    }
  }

  // ==================================================
  // RESET PASSWORD
  // ==================================================
  async resetPassword(
    dto: ResetPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const { token, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new PasswordResetPasswordMismatchException();
    }

    validatePasswordStrength(newPassword);

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // ❗ do not reveal user existence
    if (!user) return;

    const tokenHash = await hashToken(token);

    const tokenRecord =
      await this.prisma.identityVerificationToken.findFirst({
        where: {
          userId: user.id,
          type: VerificationType.PASSWORD_RESET,
          tokenHash,
          usedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

    if (!tokenRecord) {
      throw new PasswordResetTokenInvalidException();
    }

    if (tokenRecord.expiresAt <= new Date()) {
      throw new PasswordResetTokenExpiredException();
    }

    const newHashedPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    // ==================================================
    // TRANSACTION:
    // - update password
    // - revoke refresh tokens
    // - delete sessions
    // - mark token used
    // ==================================================
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          hashedPassword: newHashedPassword,
          currentRefreshTokenHash: null,
          updatedAt: new Date(),
        },
      });

      await tx.refreshToken.updateMany({
        where: {
          userId: user.id,
          revoked: false,
        },
        data: {
          revoked: true,
        },
      });

      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      await tx.identityVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });
    });

    this.logger.log(
      `[PASSWORD_RESET_SUCCESS] userId=${user.id} ip=${ipAddress} ua=${userAgent}`,
    );
  }
}

