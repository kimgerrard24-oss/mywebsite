// backend/src/users/users.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerificationType,SecurityEventType } from '@prisma/client';
import { createHash } from 'crypto';
import * as crypto from 'node:crypto';

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

  return this.prisma.user.findFirst({
    where: { id: userId },
    select: {
      // ===== ของเดิม (ไม่แก้) =====
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      coverUrl: true,
      bio: true,
      createdAt: true,
      
      isBanned: true,
      isDisabled: true,
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
 

 // ADD ONLY — do not rewrite file

async findUserForCredentialVerify(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      hashedPassword: true,
      isDisabled: true,
      isBanned: true,
      isAccountLocked: true,
    },
  });
}

 // =============================
  // Security Events
  // =============================

  async findUserSecurityEvents(params: {
    userId: string;
    limit: number;
    cursor?: Date;
  }) {
    const { userId, limit, cursor } = params;

    return this.prisma.securityEvent.findMany({
      where: {
        userId,
        ...(cursor
          ? { createdAt: { lt: cursor } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findUserSecurityState(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isDisabled: true,
        isBanned: true,
        isAccountLocked: true,
      },
    });
  }

  async isUsernameTaken(usernameLower: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        username: {
          equals: usernameLower,
          mode: 'insensitive', // 🔒 case-insensitive
        },
      },
    });

    return count > 0;
  }

  
async findUserForUsernameChange(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      isDisabled: true,
      isBanned: true,
      isAccountLocked: true,
    },
  });
}

async updateUsernameWithHistory(params: {
  userId: string;
  newUsername: string;
  oldUsername: string;
}) {
  const { userId, newUsername, oldUsername } = params;

  return this.prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });

    await tx.userIdentityHistory.create({
      data: {
        userId,
        field: 'username',
        oldValue: oldUsername,
        newValue: newUsername,
        changedBy: 'USER',
      },
    });
  });
}

async createSecurityEvent(params: {
  userId: string;
  type: SecurityEventType;
  ip?: string;
  userAgent?: string;
}) {
  const { userId, type, ip, userAgent } = params;

  await this.prisma.securityEvent.create({
    data: {
      userId,
      type,
      ip,
      userAgent,
    },
  });
}

async findUserForEmailChange(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isDisabled: true,
      isBanned: true,
      isAccountLocked: true,
    },
  });
}

async isEmailTaken(email: string): Promise<boolean> {
  const found = await this.prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return Boolean(found);
}

async createIdentityVerificationToken(params: {
  userId: string;
  type: VerificationType;
  tokenHash: string;
  target?: string;
  expiresAt: Date;
}) {
  return this.prisma.identityVerificationToken.create({
    data: {
      userId: params.userId,
      type: params.type,
      tokenHash: params.tokenHash,
      target: params.target,
      expiresAt: params.expiresAt,
    },
  });
 }

 async updateUserEmail(params: {
  userId: string;
  newEmail: string;
}) {
  await this.prisma.user.update({
    where: { id: params.userId },
    data: {
      email: params.newEmail,
      isEmailVerified: true,
      updatedAt: new Date(),
    },
  });
}

async consumeEmailChangeToken(params: {
  userId: string;
  token: string;
}) {
  const hash = createHash('sha256')
    .update(params.token)
    .digest('hex');

  const record =
    await this.prisma.identityVerificationToken.findFirst({
      where: {
        userId: params.userId,
        type: VerificationType.EMAIL_CHANGE,
        tokenHash: hash,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
    });

  if (!record) return null;

  await this.prisma.identityVerificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record;
}

async findUserForPhoneChange(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phoneNumber: true,
      isDisabled: true,
      isBanned: true,
      isAccountLocked: true,
    },
  });
}

async isPhoneTaken(phone: string): Promise<boolean> {
  const found = await this.prisma.user.findUnique({
    where: { phoneNumber: phone },
    select: { id: true },
  });

  return Boolean(found);
}


async updatePhoneWithHistory(params: {
  userId: string;
  newPhone: string;
}) {
  return this.prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: params.userId },
      select: { phoneNumber: true },
    });

    await tx.user.update({
      where: { id: params.userId },
      data: {
        phoneNumber: params.newPhone,
        isPhoneVerified: true,
      },
    });

    await tx.userIdentityHistory.create({
      data: {
        userId: params.userId,
        field: 'phone',
        oldValue: user?.phoneNumber ?? null,
        newValue: params.newPhone,
        changedBy: 'USER',
      },
    });
  });
}


async consumePhoneChangeToken(params: {
  tokenId: string;
}): Promise<boolean> {
  const res =
    await this.prisma.identityVerificationToken.updateMany({
      where: {
        id: params.tokenId,
        usedAt: null, // ✅ atomic guard
      },
      data: {
        usedAt: new Date(),
      },
    });

  return res.count === 1;
}

async findPhoneChangeTokenByHash(params: {
  userId: string;
  tokenHash: string;
}) {
  return this.prisma.identityVerificationToken.findFirst({
    where: {
      userId: params.userId,
      type: VerificationType.PHONE_CHANGE,
      tokenHash: params.tokenHash,
      usedAt: null,
    },
  });
}

async incrementPhoneChangeAttempt(id: string) {
  await this.prisma.identityVerificationToken.update({
    where: { id },
    data: {
      attemptCount: { increment: 1 },
    },
  });
}

}




