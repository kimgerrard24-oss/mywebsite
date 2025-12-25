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
        coverUrl: true,
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

     return UserProfileDto.fromUser(user, {
    isSelf: true,
  });
  
  }

 async getPublicProfile(params: {
  targetUserId: string;
  viewerUserId: string | null;
}): Promise<PublicUserProfileDto | null> {
  const { targetUserId, viewerUserId } = params;

  const user = await this.repo.findPublicUserById(targetUserId, {
    viewerUserId,
  });
  if (!user) return null;

  const isSelf =
    viewerUserId !== null && viewerUserId === user.id;

  return {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl ?? null,
    bio: user.bio,
    createdAt: user.createdAt,

    isSelf,

    isFollowing:
      !isSelf &&
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

    const users = await this.repo.searchUsers({
      query,
      limit,
    });

    // policy layer (สำคัญมาก)
    const visibleUsers = users.filter(user =>
      UserSearchPolicy.canView({
        target: user,
        viewerUserId,
      }),
    );

    return visibleUsers.map(PublicUserSearchDto.fromEntity);
  }
}


