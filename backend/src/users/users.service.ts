// file src/users/users.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from "crypto";
import { UserProfileDto } from "./dto/user-profile.dto";

@Injectable()
export class UsersService {
  private prisma = new PrismaService();

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(email: string, passwordHash: string, displayName?: string) {
    const baseUsername = email.split('@')[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;

    while (
      await this.prisma.user.findUnique({
        where: { username },
      })
    ) {
      username = `${baseUsername}_${counter++}`;
    }

    return this.prisma.user.create({
      data: {
        email,
        username,
        hashedPassword: passwordHash,
        provider: "local",
        providerId: email,
        name: displayName ?? null,
      },
    });
  }

  async setRefreshTokenHash(userId: string, hash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { currentRefreshTokenHash: hash },
    });
  }

  async setEmailVerifyToken(userId: string, hash: string, expires: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyTokenHash: hash,
        emailVerifyTokenExpires: expires,
      },
    });
  }

  async setPasswordResetToken(userId: string, hash: string, expires: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetTokenHash: hash,
        passwordResetTokenExpires: expires,
      },
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

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyTokenHash: null,
        emailVerifyTokenExpires: null,
      },
    });
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
      data: {
        hashedPassword: newPasswordHash,
        passwordResetTokenHash: null,
        passwordResetTokenExpires: null,
      },
    });
  }

  /**
   * ดึงข้อมูลโปรไฟล์แบบ "safe"
   * - ไม่ดึง hashedPassword
   * - ไม่ดึง token ต่าง ๆ
   */
  async findSafeProfileById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true, 
        username: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get current user's profile by userId (ใช้สำหรับ route GET /users/me)
   * - ปลอดภัย: ไม่ select hashedPassword / token ต่าง ๆ
   * - ถ้าไม่พบ user -> โยน NotFoundException
   */
  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }, // ถ้าคุณใช้ field อื่น เช่น firebaseUid ให้เปลี่ยนตรงนี้
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        // ไม่ select hashedPassword / token / fields ลับอื่น ๆ
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user as UserProfileDto;
  }
}
