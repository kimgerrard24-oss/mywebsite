// file: src/auth/password-reset.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordResetTokenRepository } from './password-reset-token.repository';
import { PasswordResetMailService } from '../mail/password-reset-mail.service';
import { generateSecureToken, hashToken } from '../common/security/secure-token.util';
import {
  PasswordResetPasswordMismatchException,
  PasswordResetTokenExpiredException,
  PasswordResetTokenInvalidException,
} from './password-reset.exceptions';
import { validatePasswordStrength } from './password-reset.policy';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { User } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly tokenExpiresMinutes = 15;

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordResetTokenRepo: PasswordResetTokenRepository,
    private readonly passwordResetMailService: PasswordResetMailService,
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

    let user: User | null = null;

    try {
      user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (error) {
      this.logger.error(`Error fetching user for password reset: ${error}`);
      return;
    }

    if (!user) {
      this.logger.debug(
        `Password reset requested for non-existing email: ${normalizedEmail}`,
      );
      return;
    }

    // invalidate previous tokens
    await this.passwordResetTokenRepo.invalidateTokensForUser(user.id);

    const rawToken = generateSecureToken(32);
    const tokenHash = await hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() + this.tokenExpiresMinutes * 60 * 1000,
    );

    await this.passwordResetTokenRepo.createToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

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

    this.logger.log(
      `Password reset requested for userId=${user.id}, email=${user.email}, ip=${ipAddress}, userAgent=${userAgent}`,
    );
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

    // 1. check password confirm
    if (newPassword !== confirmPassword) {
      throw new PasswordResetPasswordMismatchException();
    }

    // 2. password strength
    validatePasswordStrength(newPassword);

    // 3. find user
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // do not reveal whether user exists
    if (!user) {
      return;
    }

    // 4. find token
    const tokenRecord =
      await this.passwordResetTokenRepo.findLatestActiveTokenForUser(user.id);

    if (!tokenRecord) {
      throw new PasswordResetTokenInvalidException();
    }

    // 5. check expiry
    if (tokenRecord.expiresAt <= new Date()) {
      throw new PasswordResetTokenExpiredException();
    }

    // 6. verify token hash
    const tokenMatches = await argon2.verify(tokenRecord.tokenHash, token);

    if (!tokenMatches) {
      throw new PasswordResetTokenInvalidException();
    }

    // 7. hash new password
    const newHashedPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    // ==================================================
    // 8) TRANSACTION:
    // - update user password
    // - revoke refresh tokens
    // - delete sessions
    // - mark token used
    // ==================================================
    await this.prisma.$transaction(async (tx) => {
      // update password
      await tx.user.update({
        where: { id: user.id },
        data: {
          hashedPassword: newHashedPassword,
          currentRefreshTokenHash: null,
          updatedAt: new Date(),
        },
      });

      // revoke refresh tokens
      await tx.refreshToken.updateMany({
        where: {
          userId: user.id,
          revoked: false,
        },
        data: {
          revoked: true,
        },
      });

      // delete sessions
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // mark token used
      await tx.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: {
          usedAt: new Date(),
        },
      });
    });

    // ==================================================
    // 9) log for security
    // ==================================================
    this.logger.log(
      `Password reset completed for userId=${user.id}, email=${user.email}, ip=${ipAddress}, userAgent=${userAgent}`,
    );
  }
}
