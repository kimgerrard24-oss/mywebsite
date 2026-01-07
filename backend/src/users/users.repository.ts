// backend/src/users/users.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // =====================================================
  // Create Local User (Email / Password)
  // =====================================================
  async createUser(params: {
    email: string;
    hashedPassword: string;
    displayName?: string | null;
  }): Promise<User> {
    const { email, hashedPassword, displayName } = params;

    // deterministic username (ไม่สุ่ม เพื่อ debug ง่าย)
    const baseUsername = email.split('@')[0];

    return this.prisma.user.create({
      data: {
        email,
        username: baseUsername,
        hashedPassword,
        displayName: displayName ?? null,

        // Hybrid Auth fields (required by schema)
        provider: 'local',
        providerId: email,

        // optional / defaults
        isEmailVerified: false,
        active: true,
      },
    });
  }

  // =====================================================
  // Find by email
  // =====================================================
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // =====================================================
  // Safe profile (used by /users/me)
  // =====================================================
  async findSafeProfileById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        displayName: true,
        avatarUrl: true,
        coverUrl: true,
        bio: true,
        firebaseUid: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // =====================================================
  // Public profile (used by /users/:id)
  // =====================================================
async findPublicUserById(
  userId: string,
  params?: {
    viewerUserId?: string | null;
  },
) {
  const viewerUserId = params?.viewerUserId ?? null;

  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      // ===== ของเดิม (ไม่แก้) =====
      id: true,
      displayName: true,
      avatarUrl: true,
      coverUrl: true,
      bio: true,
      createdAt: true,

      // ===== counts =====
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },

      // ===== isFollowing =====
      followers: viewerUserId
        ? {
            where: {
              followerId: viewerUserId,
            },
            take: 1,
          }
        : false,

      // ===== block relations (ใช้ชื่อจริงจาก schema) =====

      // viewer → target (viewer block user นี้ไหม)
      blockedBy: viewerUserId
        ? {
            where: {
              blockerId: viewerUserId,
            },
            take: 1,
          }
        : false,

      // target → viewer (user นี้ block viewer ไหม)
      blockedUsers: viewerUserId
        ? {
            where: {
              blockedId: viewerUserId,
            },
            take: 1,
          }
        : false,
    },
  });
}


  async updateProfile(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }
  
  async updateAvatar(userId: string, avatarUrl: string) {
  return this.prisma.user.update({
   where: { id: userId },
  data: { avatarUrl },
  });
  }

  // =====================================================
  // Minimal user state (for policy / auth decision)
  // =====================================================
 async findUserStateById(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isDisabled: true,
      active: true,
    },
  });
 }
 
 async findById(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      active: true,
      isDisabled: true,
      coverUrl: true,
    },
  });
  }
  
  async updateCover(userId: string, coverUrl: string) {
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      coverUrl,
      updatedAt: new Date(),
    },
  });
  }

 async searchUsers(params: {
  query: string;
  limit: number;
  viewerUserId?: string | null; // ✅ NEW (optional)
}) {
  const { query, limit, viewerUserId } = params;

  return this.prisma.user.findMany({
    where: {
      AND: [
        { isDisabled: false },

        // =========================
        // 🔒 BLOCK FILTER (2-way)
        // ใช้เฉพาะเมื่อมี viewer
        // =========================
        ...(viewerUserId
          ? [
              // viewer does NOT block target
              {
                blockedBy: {
                  none: {
                    blockerId: viewerUserId,
                  },
                },
              },

              // target does NOT block viewer
              {
                blockedUsers: {
                  none: {
                    blockedId: viewerUserId,
                  },
                },
              },
            ]
          : []),

        // =========================
        // 🔍 SEARCH QUERY
        // =========================
        {
          OR: [
            {
              username: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              displayName: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
      ],
    },

    take: limit,

    orderBy: {
      createdAt: 'desc',
    },

    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true,
      isDisabled: true,
    },
  });
}


 async findUserStateWithCoverById(
  userId: string,
): Promise<{
  id: string;
  active: boolean;
  isDisabled: boolean;
  coverUrl: string | null;
} | null> {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      active: true,
      isDisabled: true,
      coverUrl: true,
    },
  });
}


}


