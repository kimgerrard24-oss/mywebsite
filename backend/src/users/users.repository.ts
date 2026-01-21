// backend/src/users/users.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerificationType,SecurityEventType,VerificationScope } from '@prisma/client';
import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';

const publicUserSelect =
  Prisma.validator<Prisma.UserSelect>()({
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    coverUrl: true,
    bio: true,
    createdAt: true,

    isBanned: true,
    isDisabled: true,
    isAccountLocked: true,
    isPrivate: true,

    _count: {
      select: {
        followers: true,
        following: true,
      },
    },

    followers: true,
    followRequestsReceived: true,
    blockedBy: true,
    blockedUsers: true,
  });

export type PublicUserWithViewerState =
  Prisma.UserGetPayload<{
    select: typeof publicUserSelect;
  }>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  private mapScopeByType(type: VerificationType): VerificationScope {
  switch (type) {
    case VerificationType.EMAIL_VERIFY:
      return VerificationScope.EMAIL_VERIFY; // หรือ EMAIL_VERIFY ถ้าคุณมี enum นี้
    case VerificationType.EMAIL_CHANGE:
      return VerificationScope.EMAIL_CHANGE;
    case VerificationType.PHONE_CHANGE:
      return VerificationScope.PHONE_CHANGE; // ถ้ายังไม่มี PHONE_CHANGE scope
    case VerificationType.PASSWORD_RESET:
      return VerificationScope.PASSWORD_CHANGE;
    default:
      throw new Error(`Unsupported verification type: ${type}`);
  }
}

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

    // local user defaults
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
): Promise<PublicUserWithViewerState | null> {
  const viewerUserId = params?.viewerUserId ?? null;

  return this.prisma.user.findFirst({
    where: { id: userId },

    select: {
      // =========================
      // BASIC PUBLIC PROFILE
      // =========================
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      coverUrl: true,
      bio: true,
      createdAt: true,

      // =========================
      // ACCOUNT STATE (for policy)
      // =========================
      isBanned: true,
      isDisabled: true,
      isAccountLocked: true,
      isPrivate: true,

      // =========================
      // COUNTS
      // =========================
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },

      // =========================
      // FOLLOW RELATION (viewer → target)
      // =========================
      followers: viewerUserId
        ? {
            where: { followerId: viewerUserId },
            take: 1,
            select: { followerId: true },
          }
        : false,

      // =========================
      // FOLLOW REQUEST (viewer → target)
      // =========================
      followRequestsReceived: viewerUserId
        ? {
            where: { requesterId: viewerUserId },
            take: 1,
            select: { id: true },
          }
        : false,

      // =========================
      // BLOCK: viewer blocked target?
      // =========================
      blockedBy: viewerUserId
        ? {
            where: { blockerId: viewerUserId },
            take: 1,
            select: { blockerId: true },
          }
        : false,

      // =========================
      // BLOCK: target blocked viewer?
      // =========================
      blockedUsers: viewerUserId
        ? {
            where: { blockedId: viewerUserId },
            take: 1,
            select: { blockedId: true },
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
      scope: this.mapScopeByType(params.type),
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
        scope: VerificationScope.EMAIL_CHANGE,
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
      scope: VerificationScope.PHONE_CHANGE,
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


async confirmEmailChangeAtomic(params: {
  userId: string;
  tokenHash: string;
}): Promise<{ newEmail: string } | null> {
  const now = new Date();

  return this.prisma.$transaction(async (tx) => {
    // =================================================
    // 1) Find active EMAIL_CHANGE token
    // =================================================
    const token =
      await tx.identityVerificationToken.findFirst({
        where: {
          userId: params.userId,
          type: VerificationType.EMAIL_CHANGE,
          scope: VerificationScope.EMAIL_CHANGE,
          tokenHash: params.tokenHash,
          usedAt: null,
          expiresAt: { gt: now },
        },
        select: {
          id: true,
          target: true,
        },
      });

    if (!token || !token.target) {
      return null;
    }

    // =================================================
    // 2) Load current email (for identity history)
    // =================================================
    const user = await tx.user.findUnique({
      where: { id: params.userId },
      select: { email: true },
    });

    if (!user) {
      return null;
    }

    // =================================================
    // 3) Consume token (atomic guard, no reuse)
    // =================================================
    const consumed =
      await tx.identityVerificationToken.updateMany({
        where: {
          id: token.id,
          usedAt: null, // race-safe guard
        },
        data: {
          usedAt: now,
        },
      });

    if (consumed.count !== 1) {
      return null;
    }

    // =================================================
    // 4) Update user email
    //     - rely on DB unique constraint for conflicts
    // =================================================
    await tx.user.update({
      where: { id: params.userId },
      data: {
        email: token.target,
        isEmailVerified: true,
      },
    });

    // =================================================
    // 5) Identity history (forensic-grade)
    // =================================================
    await tx.userIdentityHistory.create({
      data: {
        userId: params.userId,
        field: 'email',
        oldValue: user.email,
        newValue: token.target,
        changedBy: 'USER',
      },
    });

    return { newEmail: token.target };
  });
}

async confirmEmailChangeByTokenAtomic(params: {
  tokenHash: string;
}): Promise<{ userId: string; newEmail: string } | null> {
  const now = new Date();

  return this.prisma.$transaction(async (tx) => {
    const token =
      await tx.identityVerificationToken.findFirst({
        where: {
          tokenHash: params.tokenHash,
          type: VerificationType.EMAIL_CHANGE,
          scope: VerificationScope.EMAIL_CHANGE,
          usedAt: null,
          expiresAt: { gt: now },
        },
      });

    if (!token || !token.target) return null;

    const user =
      await tx.user.findUnique({
        where: { id: token.userId },
        select: { email: true },
      });

    if (!user) return null;

    // 1) update email
    await tx.user.update({
      where: { id: token.userId },
      data: {
        email: token.target,
        isEmailVerified: true,
      },
    });

    // 2) consume token (no reuse)
    await tx.identityVerificationToken.update({
      where: { id: token.id },
      data: { usedAt: now },
    });

    // 3) identity history (forensic-grade)
    await tx.userIdentityHistory.create({
      data: {
        userId: token.userId,
        field: 'email',
        oldValue: user.email,
        newValue: token.target,
        changedBy: 'USER',
      },
    });

    return { userId: token.userId, newEmail: token.target };
  });
}

async findUserForPolicyCheck(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isAccountLocked: true,
      isBanned: true,
      isDisabled: true,
    },
  });
}
}




