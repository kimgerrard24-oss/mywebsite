// file src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserProfileDto } from "./dto/user-profile.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(email: string, passwordHash: string, displayName?: string) {
    const baseUsername = email.split("@")[0].toLowerCase();
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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.user.update({
      where: { id: userId },
      data: { currentRefreshTokenHash: hash },
    });
  }

  async setEmailVerifyToken(userId: string, hash: string, expires: Date) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyTokenHash: hash,
        emailVerifyTokenExpires: expires,
      },
    });
  }

  async setPasswordResetToken(userId: string, hash: string, expires: Date) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

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

    if (!user) throw new BadRequestException("Invalid or expired token");

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

    if (!user) throw new BadRequestException("Invalid or expired token");

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword: newPasswordHash,
        passwordResetTokenHash: null,
        passwordResetTokenExpires: null,
      },
    });
  }

  async findSafeProfileById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user as UserProfileDto;
  }

  /**
   * Get the current user's profile by userId (for route GET /users/me)
   *
   * IMPORTANT:
   * - Auth is already validated by guard (JWT + Redis)
   * - This method should NOT be used to decide auth state
   */
  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException(
        "Authenticated user profile not found"
      );
    }

    return user as UserProfileDto;
  }
}
