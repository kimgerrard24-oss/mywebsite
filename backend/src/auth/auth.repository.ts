// file: src/auth/auth.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<{
    id: string;
    email: string;
    username: string;
    name: string | null;
    hashedPassword: string | null;
    isDisabled: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        hashedPassword: true,
        isDisabled: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Legacy function (no longer used in new Redis-based session system)
   * Disabled to avoid accidental usage.
   */
  async createRefreshToken(): Promise<never> {
    throw new Error(
      'createRefreshToken() is deprecated. Refresh tokens are now stored in Redis only.'
    );
  }

 async findByEmailOrUsername(
  rawEmail?: string | null,
  rawUsername?: string | null,
) {
  // =================================================
  // 1) Normalize inputs (defensive)
  // =================================================
  const email =
    typeof rawEmail === 'string' && rawEmail.trim().length > 0
      ? rawEmail.trim().toLowerCase()
      : null;

  const username =
    typeof rawUsername === 'string' && rawUsername.trim().length > 0
      ? rawUsername.trim()
      : null;

  // =================================================
  // 2) Build OR only with valid fields
  // =================================================
  const or: any[] = [];

  if (email) or.push({ email });
  if (username) or.push({ username });

  if (or.length === 0) {
    return null;
  }

  // =================================================
  // 3) Query (for validation / UX only)
  // =================================================
  return this.prisma.user.findFirst({
    where: { OR: or },
  });
}


  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }
}
