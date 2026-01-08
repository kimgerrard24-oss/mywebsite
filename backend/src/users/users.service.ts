// file src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserProfileDto } from "./dto/user-profile.dto";
import { UsersRepository } from './users.repository';
import { PublicUserProfileDto } from './dto/public-user-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileAudit } from './audit/user-profile.audit';
import { AuditLogService } from './audit/audit-log.service';
import { AvatarService } from './avatar/avatar.service';
import { UserAvatarPolicy } from './avatar/user-avatar.policy';
import { CoverService } from './cover/cover.service';
import { UserCoverPolicy } from './cover/user-cover.policy';
import { PublicUserSearchDto } from './dto/public-user-search.dto';
import { UserSearchPolicy } from './policies/user-search.policy';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService,
              private readonly repo: UsersRepository,
              private readonly audit: UserProfileAudit,
              private readonly avatarService: AvatarService,
              private readonly auditLogService: AuditLogService,
              private readonly coverService: CoverService,
  ) {}

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

  const updated = await this.prisma.user.update({
    where: { id: userId },
    data: {
      emailVerifyTokenHash: hash,
      emailVerifyTokenExpires: expires,
    },
  });

  // ===============================
  // ✅ AUDIT LOG: REQUEST EMAIL VERIFY
  // ===============================
  try {
    await this.auditLogService.log({
      userId,
      action: 'USER_REQUEST_EMAIL_VERIFY',
      success: true,
    });
  } catch {
    // must not affect main flow
  }

  return updated;
}


 async setPasswordResetToken(
  userId: string,
  hash: string,
  expires: Date,
) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user)
    throw new NotFoundException('User not found');

  const updated = await this.prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetTokenHash: hash,
      passwordResetTokenExpires: expires,
    },
  });

  // ===============================
  // ✅ AUDIT LOG: REQUEST PASSWORD RESET
  // ===============================
  try {
    await this.auditLogService.log({
      userId,
      action: 'USER_REQUEST_PASSWORD_RESET',
      success: true,
    });
  } catch {
    // must not affect main flow
  }

  return updated;
}


  async verifyEmailByToken(tokenHash: string) {
  const user = await this.prisma.user.findFirst({
    where: {
      emailVerifyTokenHash: tokenHash,
      emailVerifyTokenExpires: { gt: new Date() },
    },
  });

  if (!user) throw new BadRequestException('Invalid or expired token');

  const updated = await this.prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyTokenHash: null,
      emailVerifyTokenExpires: null,
    },
  });

  // ===============================
  // ✅ AUDIT LOG: VERIFY EMAIL
  // ===============================
  try {
    await this.auditLogService.log({
      userId: user.id,
      action: 'USER_VERIFY_EMAIL',
      success: true,
    });
  } catch {
    // must not affect verify flow
  }

  return updated;
}


  async resetPasswordByToken(
  tokenHash: string,
  newPasswordHash: string,
) {
  const user = await this.prisma.user.findFirst({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpires: { gt: new Date() },
    },
  });

  if (!user)
    throw new BadRequestException(
      'Invalid or expired token',
    );

  const updated = await this.prisma.user.update({
    where: { id: user.id },
    data: {
      hashedPassword: newPasswordHash,
      passwordResetTokenHash: null,
      passwordResetTokenExpires: null,
    },
  });

  // ===============================
  // ✅ AUDIT LOG: RESET PASSWORD
  // ===============================
  try {
    await this.auditLogService.log({
      userId: user.id,
      action: 'USER_RESET_PASSWORD',
      success: true,
    });
  } catch {
    // must not affect reset flow
  }

  return updated;
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
        coverUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return UserProfileDto.fromUser(user, {
  isSelf: false,
 });
  }


  /**
   * Get the current user's profile by userId (for route GET /users/me)
   *
   * IMPORTANT:
   * - Auth is already validated by guard (JWT + Redis)
   * - This method should NOT be used to decide auth state
   */
async getMe(userId: string): Promise<PublicUserProfileDto> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      username: true,
      name: true,
      avatarUrl: true,
      coverUrl: true,
      bio: true,
      createdAt: true,
      updatedAt: true,

      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    throw new BadRequestException(
      'Authenticated user profile not found',
    );
  }

  return {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl ?? null,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),

    isSelf: true,

    // ✅ self ไม่มี block concept
    isBlocked: false,
    hasBlockedViewer: false,

    isFollowing: false, // self ไม่มี concept follow ตัวเอง

    stats: {
      followers: user._count.followers,
      following: user._count.following,
    },
  };
}

async getPublicProfile(params: {
  targetUserId: string;
  viewerUserId: string | null;
}): Promise<PublicUserProfileDto | null> {
  const { targetUserId, viewerUserId } = params;

  const user = await this.repo.findPublicUserById(
    targetUserId,
    { viewerUserId },
  );

  if (!user) return null;

  const isSelf =
    viewerUserId !== null && viewerUserId === user.id;

  /**
   * ===== Block relation (from repo joins) =====
   * - blockedBy      => viewer block target?
   * - blockedUsers   => target block viewer?
   */
  const isBlockedByViewer =
    Array.isArray(user.blockedBy) &&
    user.blockedBy.length > 0;

  const hasBlockedViewer =
    Array.isArray(user.blockedUsers) &&
    user.blockedUsers.length > 0;

  /**
   * 🔒 HARD VISIBILITY GUARD (CRITICAL)
   * If either side blocks → profile must not be visible at all
   * Backend is authority.
   */
  if (!isSelf && (isBlockedByViewer || hasBlockedViewer)) {
    return null; // Controller should map to 404
  }

  return {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl ?? null,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),

    isSelf,

    /**
     * 👇 UX snapshot only (frontend decides button)
     */
    isBlocked: isBlockedByViewer,

    hasBlockedViewer,

    isFollowing:
      !isSelf &&
      !isBlockedByViewer &&
      Array.isArray(user.followers) &&
      user.followers.length > 0,

    stats: {
      followers: user._count?.followers ?? 0,
      following: user._count?.following ?? 0,
    },
  };
}



   async updateProfile(userId: string, dto: UpdateUserDto) {
    const updated = await this.repo.updateProfile(userId, dto);

    // fire-and-forget audit (do not block request)
    this.audit.logProfileUpdate({
      userId,
      fields: Object.keys(dto),
    });

    return updated;
  }
  

async updateAvatar(params: {
  userId: string;
  file: Express.Multer.File;
}) {
  const { userId, file } = params;

  const user = await this.repo.findUserStateById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  UserAvatarPolicy.assertCanUpdateAvatar({
    isDisabled: user.isDisabled,
    isActive: user.active,
  });

  let avatarUrl: string;

  try {
    const result = await this.avatarService.processAndUpload({
      userId,
      file,
    });

    avatarUrl = result.avatarUrl;
  } catch (err) {
    // สำคัญ: แยก infra error ออกจาก business error
    throw new InternalServerErrorException(
      'Failed to process or upload avatar',
    );
  }

  await this.repo.updateAvatar(userId, avatarUrl);

  await this.auditLogService.log({
    userId,
    action: 'USER_UPDATE_AVATAR',
    success: true,
  });

  return { success: true, avatarUrl };
   }
 

 async updateCover(params: {
  userId: string;
  file: Express.Multer.File;
  }) {
  const { userId, file } = params;

  const user = await this.repo.findUserStateWithCoverById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  UserCoverPolicy.assertCanUpdateCover({
    isActive: user.active,
    isDisabled: user.isDisabled,
  });

  UserCoverPolicy.assertValidCoverFile(file);

  let coverUrl: string;

  try {
    const result = await this.coverService.processAndUpload({
      userId,
      file,
      previousCoverUrl: user.coverUrl ?? null,
    });

    coverUrl = result.coverUrl;
  } catch {
    throw new InternalServerErrorException(
      'Failed to process or upload cover',
    );
  }

  await this.repo.updateCover(userId, coverUrl);

  await this.auditLogService.log({
    userId,
    action: 'USER_UPDATE_COVER',
    success: true,
  });

  return { success: true, coverUrl };
 }


  async searchUsers(params: {
  query: string;
  limit: number;
  viewerUserId: string;
}): Promise<PublicUserSearchDto[]> {
  const { query, limit, viewerUserId } = params;

  // ✅ ให้ repo กรอง block ตั้งแต่ระดับ DB
  const users = await this.repo.searchUsers({
    query,
    limit,
    viewerUserId, // ✅ สำคัญมาก
  });

  // ✅ policy layer ยังเก็บไว้ได้ (defense-in-depth)
  const visibleUsers = users.filter(user =>
    UserSearchPolicy.canView({
      target: user,
      viewerUserId,
    }),
  );

  return visibleUsers.map(PublicUserSearchDto.fromEntity);
}

}


