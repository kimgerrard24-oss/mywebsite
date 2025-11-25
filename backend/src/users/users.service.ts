import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  private prisma = new PrismaClient();

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(email: string, passwordHash: string, displayName?: string) {
    return this.prisma.user.create({
      data: { email, hashedPassword: passwordHash, displayName },
    });
  }

  async setRefreshTokenHash(userId: string, hash: string | null) {
    return this.prisma.user.update({ where: { id: userId }, data: { currentRefreshTokenHash: hash } });
  }

  async setEmailVerifyToken(userId: string, hash: string, expires: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifyTokenHash: hash, emailVerifyTokenExpires: expires },
    });
  }

  async setPasswordResetToken(userId: string, hash: string, expires: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordResetTokenHash: hash, passwordResetTokenExpires: expires },
    });
  }

  async verifyEmailByToken(tokenHash: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyTokenHash: tokenHash,
        emailVerifyTokenExpires: { gt: new Date() },
      },
    });
    if (!user) return null;
    return this.prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true, emailVerifyTokenHash: null, emailVerifyTokenExpires: null } });
  }

  async resetPasswordByToken(tokenHash: string, newPasswordHash: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpires: { gt: new Date() },
      },
    });
    if (!user) return null;
    return this.prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword: newPasswordHash, passwordResetTokenHash: null, passwordResetTokenExpires: null },
    });
  }
}
