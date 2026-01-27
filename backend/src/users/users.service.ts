// file src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserProfileDto } from "./dto/user-profile.dto";
import { UsersRepository } from './users.repository';
import { MeUserProfileDto, PublicUserProfileDto } from './dto/public-user-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileAudit } from './audit/user-profile.audit';
import { AuditLogService } from './audit/audit-log.service';
import { AvatarService } from './avatar/avatar.service';
import { UserAvatarPolicy } from './avatar/user-avatar.policy';
import { CoverService } from './cover/cover.service';
import { UserCoverPolicy } from './cover/user-cover.policy';
import { PublicUserSearchDto } from './dto/public-user-search.dto';
import { UserSearchPolicy } from './policies/user-search.policy';
import { verifyPassword } from '../auth/utils/password.util';
import { VerifyCredentialDto } from './dto/verify-credential.dto';
import { VerifyCredentialPolicy } from './policies/verify-credential.policy';
import { CredentialVerificationService } from '../auth/credential-verification.service';
import { SecurityEventsPolicy } from './policies/security-events.policy';
import { SecurityEventResponseDto } from './dto/security-event.response.dto';
import { SecurityEventsAudit } from './audit/security-events.audit';
import { UsernameAvailabilityPolicy } from './policies/username-availability.policy';
import { UpdateUsernamePolicy } from './policies/update-username.policy';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { VerificationType,SecurityEventType,VerificationScope } from '@prisma/client';
import { EmailChangeRequestDto } from './dto/email-change-request.dto';
import { EmailChangePolicy } from './policies/email-change.policy';
import { ConfirmEmailChangePolicy } from './policies/confirm-email-change.policy';
import { ConfirmEmailChangeDto } from './dto/confirm-email-change.dto'
import { RequestPhoneChangeDto } from './dto/request-phone-change.dto';
import { RequestPhoneChangePolicy } from './policies/request-phone-change.policy';
import { UserIdentityAudit } from './audit/user-identity.audit';
import { PhoneVerificationService } from '../identities/phone/phone-verification.service';
import { ConfirmPhoneChangeDto } from './dto/confirm-phone-change.dto';
import { ConfirmPhoneChangePolicy } from './policies/confirm-phone-change.policy';
import { createHash } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { UserTaggedPostsViewPolicy } from './policies/user-tagged-posts-view.policy';
import { MyTaggedPostFeedItemDto } from './dto/my-tagged-post-feed-item.dto';
import { UserTagSettingsUpdatePolicy } from './policies/user-tag-settings-update.policy';
import { TagSettingsResponseDto } from './dto/tag-settings.response.dto';
import { UserTagSettingsAudit } from './audit/user-tag-settings.audit';
import { PostUserTagCreatePolicy } from '../posts/policy/post-user-tag-create.policy';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly prisma: PrismaService,
              private readonly repo: UsersRepository,
              private readonly audit: UserProfileAudit,
              private readonly avatarService: AvatarService,
              private readonly auditLogService: AuditLogService,
              private readonly coverService: CoverService,
              private readonly credentialVerify: CredentialVerificationService,
              private readonly securityAudit: SecurityEventsAudit,
              private readonly identityAudit: UserIdentityAudit,
              private readonly phoneVerify: PhoneVerificationService,
              private readonly mailService: MailService,
              private readonly tagSettingsAudit: UserTagSettingsAudit,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

 async createUser(
  email: string,
  passwordHash: string,
  displayName?: string,
) {
  // =================================================
  // 1) Normalize email (GLOBAL IDENTITY KEY)
  // =================================================
  const normalizedEmail = email.trim().toLowerCase();

  // =================================================
  // 2) Check duplicate email (explicit, fast-fail)
  // =================================================
  const existingByEmail =
    await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

  if (existingByEmail) {
    throw new ConflictException(
      'Email already registered',
    );
  }

  // =================================================
  // 3) Generate unique username
  // =================================================
  const baseUsername =
    normalizedEmail.split('@')[0].toLowerCase();

  let username = baseUsername;
  let counter = 1;

  while (
    await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })
  ) {
    username = `${baseUsername}_${counter++}`;
  }

  // =================================================
  // 4) Create user (race-safe)
  // =================================================
  try {
    return await this.prisma.user.create({
  data: {
    email: normalizedEmail,
    username,
    hashedPassword: passwordHash,
    name: displayName ?? null,
  },
});

  } catch (e: any) {
    // ---------------------------------------------
    // Unique constraint (race condition)
    // ---------------------------------------------
    if (e?.code === 'P2002') {
      // email or username collided concurrently
      throw new ConflictException(
        'Email or username already exists',
      );
    }

    throw e;
  }
}


  async setRefreshTokenHash(userId: string, hash: string | null) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.user.update({
      where: { id: userId },
      data: { currentRefreshTokenHash: hash },
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
async getMe(userId: string): Promise<MeUserProfileDto> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isEmailVerified: true,
      displayName: true,
      username: true,
      name: true,
      avatarUrl: true,
      coverUrl: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
      isDisabled: true,
      isPrivate: true,


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

  const hasActiveModeration =
  user.isDisabled === true; // self route ไม่มี isBanned ปกติ

return {
  id: user.id,
  email: user.email,
  isEmailVerified: user.isEmailVerified,
  username: user.username, 
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  coverUrl: user.coverUrl ?? null,
  bio: user.bio,
  createdAt: user.createdAt.toISOString(),
  isPrivate: user.isPrivate,
  isSelf: true,
  isBlocked: false,
  hasBlockedViewer: false,
  isFollowing: false,

  stats: {
    followers: user._count.followers,
    following: user._count.following,
  },

  /** UX guard */
  canAppeal: Boolean(hasActiveModeration),
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

  // =========================
  // SELF
  // =========================
  const isSelf =
    viewerUserId !== null && viewerUserId === user.id;

  // =========================
  // BLOCK RELATION (viewer-aware)
  // =========================
  const isBlockedByViewer =
    Array.isArray(user.blockedBy) &&
    user.blockedBy.length > 0;

  const hasBlockedViewer =
    Array.isArray(user.blockedUsers) &&
    user.blockedUsers.length > 0;

  // 🔒 HARD VISIBILITY — block hides profile
  if (!isSelf && (isBlockedByViewer || hasBlockedViewer)) {
    return null;
  }

  // =========================
  // FOLLOW STATE
  // =========================
  const isFollowing =
    !isSelf &&
    !isBlockedByViewer &&
    Array.isArray(user.followers) &&
    user.followers.length > 0;

  // ✅ NEW — pending follow request (private account)
  const isFollowRequested =
  !isSelf &&
  Array.isArray(user.followRequestsReceived) &&
  user.followRequestsReceived.length > 0;


  // =========================
  // APPEAL UX GUARD
  // =========================
  const hasActiveModeration =
    user.isBanned === true ||
    user.isDisabled === true ||
    user.isAccountLocked === true;

  const canAppeal =
    Boolean(isSelf && hasActiveModeration);
  
  const canViewContent =
  !user.isPrivate ||
  isSelf ||
  isFollowing;

  // =========================
  // RESPONSE (PUBLIC DTO)
  // =========================
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl ?? null,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),

    // ===== viewer-aware flags =====
    isSelf,

    isPrivate: user.isPrivate, // ✅ NEW — FE decides follow vs request

    isBlocked: isBlockedByViewer,
    hasBlockedViewer,

    isFollowing,

    isFollowRequested,
    canViewContent,
    // ===== stats =====
    stats: {
      followers: user._count?.followers ?? 0,
      following: user._count?.following ?? 0,
    },

    /** UX guard only — backend still authority */
    canAppeal,
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

  // =================================================
  // 1) Load users with tag permission context (DB authority)
  // =================================================
  const users =
    await this.repo.searchUsersWithTagContext({
      query,
      limit,
      viewerUserId,
    });

  // =================================================
  // 2) Visibility policy (defense-in-depth)
  // =================================================
  const visibleUsers = users.filter((user) =>
    UserSearchPolicy.canView({
      target: {
        isDisabled: user.isDisabled,
        isBlockedByViewer: user.isBlockedByViewer,
        hasBlockedViewer: user.hasBlockedViewer,
      },
      viewerUserId,
    }),
  );

  // =================================================
  // 3) Tag permission hint (UX only)
  // =================================================
  return visibleUsers.map((user) => {
    const decision = PostUserTagCreatePolicy.decideCreateTag({
      actorUserId: viewerUserId,
      taggedUserId: user.id,

      // relations
      isBlockedEitherWay: user.isBlockedEitherWay,
      isFollower: user.isFollower,     // viewer -> target
      isFollowing: user.isFollowing,   // target -> viewer

      // privacy
      isPrivateAccount: user.isPrivate,

      // tag setting
      setting: user.tagSetting,
    });

    return PublicUserSearchDto.fromEntity({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,

      // 🔥 UX hint
      canBeTagged: decision.allowed,
      tagBlockReason: decision.reason,
    });
  });
}



 async verifyCredential(
  userId: string,
  dto: VerifyCredentialDto,
  meta?: { ip?: string; userAgent?: string; jti?: string },
) {
  // =================================================
  // 1) Load user (DB authority)
  // =================================================
  const user = await this.repo.findUserForCredentialVerify(userId);
  if (!user) {
    throw new BadRequestException('User not found');
  }

  // =================================================
  // 2) Business policy
  // =================================================
  VerifyCredentialPolicy.assertCanVerify({
    isDisabled: user.isDisabled,
    isBanned: user.isBanned,
    isAccountLocked: user.isAccountLocked,
  });

  const allowedScopes = ['ACCOUNT_LOCK', 'PROFILE_EXPORT'] as const;

if (!allowedScopes.includes(dto.scope)) {
  throw new BadRequestException('Invalid verification scope');
}


  // =================================================
  // 3) OAuth / no-password guard
  // =================================================
  if (!user.hashedPassword) {
    throw new BadRequestException(
      'Password authentication not available for this account',
    );
  }

  // =================================================
  // 4) Verify password
  // =================================================
  const isValid = await verifyPassword(
    user.hashedPassword,
    dto.password,
  );

  if (!isValid) {
    // ---- security event (login failed / sensitive verify failed) ----
    try {
      await this.repo.createSecurityEvent({
        userId,
        type: SecurityEventType.LOGIN_FAILED,
        ip: meta?.ip,
        userAgent: meta?.userAgent,
      });
    } catch {
      // fail-soft
    }

    throw new BadRequestException('Invalid credential');
  }

  // =================================================
  // 5) Mark session as sensitive-verified (Redis authority)
  // =================================================
  if (!meta?.jti) {
    // defensive: sensitive verify must be bound to session
    throw new BadRequestException(
      'Session verification required',
    );
  }

  try {
    await this.credentialVerify.markSessionVerified({
      userId,
      jti: meta.jti,
      scope: dto.scope,
      ttlSeconds: 300, // 5 minutes
    });
  } catch (err) {
    // Redis failure must not silently allow sensitive action
    this.logger.error(
      '[MARK_SESSION_VERIFIED_FAILED]',
      err,
    );

    throw new BadRequestException(
      'Unable to verify sensitive session',
    );
  }

  // =================================================
  // 6) Security event (credential verified)
  // =================================================
  try {
    await this.repo.createSecurityEvent({
      userId,
      type: SecurityEventType.CREDENTIAL_VERIFIED,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    });
  } catch {
    // fail-soft (audit only)
  }

  return { success: true };
}



 // =============================
  // GET /users/me/security-events
  // =============================
  async getMySecurityEvents(params: {
    userId: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    items: SecurityEventResponseDto[];
    nextCursor: string | null;
  }> {
    const { userId, cursor } = params;

    const user = await this.repo.findUserSecurityState(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    SecurityEventsPolicy.assertCanRead({
      isDisabled: user.isDisabled,
      isBanned: user.isBanned,
    });

    const limit = SecurityEventsPolicy.normalizeLimit(
      params.limit,
    );

    const events = await this.repo.findUserSecurityEvents({
      userId,
      limit: limit + 1,
      cursor: cursor ? new Date(cursor) : undefined,
    });

    const hasNext = events.length > limit;
    const sliced = hasNext
      ? events.slice(0, limit)
      : events;

    const nextCursor = hasNext
      ? sliced[sliced.length - 1].createdAt.toISOString()
      : null;

    // fire-and-forget audit
    this.securityAudit.logViewed(userId);

    return {
      items: sliced.map(SecurityEventResponseDto.fromEntity),
      nextCursor,
    };
  }

  async checkUsernameAvailability(raw: string) {
    const normalized =
      UsernameAvailabilityPolicy.normalize(raw);

    const policy =
      UsernameAvailabilityPolicy.assertAllowed(normalized);

    if (!policy.allowed) {
      return {
        available: false,
        reason: policy.reason,
      };
    }

    const taken =
      await this.repo.isUsernameTaken(normalized);

    return {
      available: !taken,
    };
  }

  async updateUsername(
  userId: string,
  dto: UpdateUsernameDto,
  meta?: { ip?: string; userAgent?: string },
) {
  const user = await this.repo.findUserForUsernameChange(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  UpdateUsernamePolicy.assertCanChange({
    isDisabled: user.isDisabled,
    isBanned: user.isBanned,
    isAccountLocked: user.isAccountLocked,
  });

  UpdateUsernamePolicy.assertValidUsername(dto.username);

  if (dto.username === user.username) {
    throw new BadRequestException('Username is unchanged');
  }

  const taken = await this.repo.isUsernameTaken(dto.username);
  if (taken) {
    throw new ConflictException('Username already taken');
  }

  await this.repo.updateUsernameWithHistory({
    userId,
    newUsername: dto.username,
    oldUsername: user.username,
  });

  await this.repo.createSecurityEvent({
    userId,
    type: 'USERNAME_CHANGED',
    ip: meta?.ip,
    userAgent: meta?.userAgent,
  });

  return { success: true, username: dto.username };
 }

async requestEmailChange(
  userId: string,
  dto: EmailChangeRequestDto,
  meta?: { ip?: string; userAgent?: string },
) {
  const now = new Date();

  // =================================================
  // 1) Load user (authority)
  // =================================================
  const user = await this.repo.findUserForEmailChange(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  // =================================================
  // 2) Business policy
  // =================================================
  EmailChangePolicy.assertCanRequest({
    isDisabled: user.isDisabled,
    isBanned: user.isBanned,
    isAccountLocked: user.isAccountLocked,
  });

  // =================================================
  // 3) Normalize + validate new email
  // =================================================
  const normalizedNewEmail =
    dto.newEmail.trim().toLowerCase();

  if (normalizedNewEmail === user.email) {
    throw new BadRequestException('Email is unchanged');
  }

  const emailTaken =
    await this.repo.isEmailTaken(normalizedNewEmail);

  if (emailTaken) {
    throw new ConflictException('Email already in use');
  }

  // =================================================
  // 4) Generate verification token
  // =================================================
  const token = this.credentialVerify.generateToken();
  const expiresAt = this.credentialVerify.getExpiry(15);

  // =================================================
  // 5) Atomic revoke old + create new EMAIL_CHANGE token
  // =================================================
  try {
    await this.prisma.$transaction(async (tx) => {
      await tx.identityVerificationToken.updateMany({
        where: {
          userId,
          type: VerificationType.EMAIL_CHANGE,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          usedAt: now,
        },
      });

      await tx.identityVerificationToken.create({
        data: {
          userId,
          type: VerificationType.EMAIL_CHANGE,
          scope: VerificationScope.EMAIL_CHANGE,
          tokenHash: token.hash,
          target: normalizedNewEmail,
          expiresAt,
        },
      });
    });
  } catch (err) {
    this.logger.error(
      '[EMAIL_CHANGE_TOKEN_TX_FAILED]',
      err,
    );

    throw new BadRequestException(
      'Unable to process email change request',
    );
  }

  // =================================================
  // 6) Build verification URL
  // =================================================
  const publicSiteUrl = process.env.PUBLIC_SITE_URL;

  if (!publicSiteUrl) {
    this.logger.error(
      '[EMAIL_CHANGE] PUBLIC_SITE_URL not configured',
    );

    throw new BadRequestException(
      'Unable to send verification email',
    );
  }

  const verifyUrl =
    `${publicSiteUrl}/settings/email-confirm?token=${encodeURIComponent(
      token.raw,
    )}`;

  // =================================================
  // 7) Send verification email (Resend)
  // =================================================
  try {
    await this.mailService.sendEmailVerification(
      normalizedNewEmail,
      verifyUrl,
    );
  } catch (err) {
    // token ยัง valid → user ขอ resend ได้
    this.logger.error(
      '[EMAIL_CHANGE_SEND_FAILED]',
      err,
    );

    throw new BadRequestException(
      'Unable to send verification email',
    );
  }

  // =================================================
  // 8) Security event (non-blocking)
  // =================================================
  try {
    await this.repo.createSecurityEvent({
      userId,
      type: SecurityEventType.EMAIL_CHANGE_REQUEST,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    });
  } catch {
    // must not affect main flow
  }

  return { success: true };
}




async confirmEmailChange(
  userId: string,
  dto: ConfirmEmailChangeDto,
  meta?: { ip?: string; userAgent?: string },
) {
  // =================================================
  // 1) Load user (authority)
  // =================================================
  const user = await this.repo.findUserForEmailChange(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  // =================================================
  // 2) Business policy
  // =================================================
  ConfirmEmailChangePolicy.assertCanConfirm({
    isDisabled: user.isDisabled,
    isBanned: user.isBanned,
    isAccountLocked: user.isAccountLocked,
  });

  // =================================================
  // 3) Validate + hash token (server authority)
  // =================================================
  if (!dto.token || typeof dto.token !== 'string') {
    throw new BadRequestException('Invalid verification token');
  }

  const tokenHash = createHash('sha256')
    .update(dto.token)
    .digest('hex');

  // =================================================
  // 4) Atomic confirm (token + email + history)
  // =================================================
  let result: { newEmail: string } | null = null;

  try {
    result = await this.repo.confirmEmailChangeAtomic({
      userId,
      tokenHash,
    });
  } catch (err: any) {
    /**
     * Possible cause:
     * - unique constraint on email (race condition)
     * - DB failure
     */
    this.logger.error(
      '[EMAIL_CHANGE_CONFIRM_TX_FAILED]',
      err,
    );

    // Prisma unique constraint
    if (err?.code === 'P2002') {
      throw new ConflictException('Email already in use');
    }

    throw new BadRequestException(
      'Unable to confirm email change',
    );
  }

  if (!result) {
    // ---- Security Event: invalid / reused / expired token ----
    try {
      await this.repo.createSecurityEvent({
        userId,
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        ip: meta?.ip,
        userAgent: meta?.userAgent,
      });
    } catch {}

    throw new BadRequestException(
      'Invalid or expired token',
    );
  }

  // =================================================
  // 5) Security Event (success)
  // =================================================
  try {
    await this.repo.createSecurityEvent({
      userId,
      type: SecurityEventType.EMAIL_CHANGED,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    });
  } catch {}

  // =================================================
  // 6) Identity Audit (fire-and-forget)
  // =================================================
  try {
    this.identityAudit.logEmailChanged(userId);
  } catch {}

  return { success: true };
}



async requestPhoneChange(
  userId: string,
  dto: RequestPhoneChangeDto,
  meta?: { ip?: string; userAgent?: string },
) {
  const now = new Date();

  // =================================================
  // 1) Load user (authoritative)
  // =================================================
  const user = await this.repo.findUserForPhoneChange(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  // =================================================
  // 2) Business policy
  // =================================================
  RequestPhoneChangePolicy.assertCanRequest({
    isDisabled: user.isDisabled,
    isBanned: user.isBanned,
    isAccountLocked: user.isAccountLocked,
  });

  // =================================================
  // 3) Normalize + validate phone (SERVER authority)
  // =================================================
  const normalizedPhone =
    RequestPhoneChangePolicy.normalizePhone(
      dto.phone,
      dto.countryCode,
    );

  // =================================================
  // 4) Unique constraint (anti-enumeration safe)
  // =================================================
  const taken = await this.repo.isPhoneTaken(normalizedPhone);

  if (taken) {
    // ไม่บอกชัดว่ามี user ไหนใช้ → ป้องกัน enumeration
    throw new BadRequestException(
      'Unable to use this phone number',
    );
  }

  // =================================================
  // 5) Generate verification token
  // =================================================
  const token = this.credentialVerify.generateToken();
  const expiresAt = this.credentialVerify.getExpiry(10);

  // =================================================
  // 6) Atomic revoke old + create new token
  // =================================================
  try {
    await this.prisma.$transaction(async (tx) => {
      await tx.identityVerificationToken.updateMany({
        where: {
          userId,
          type: VerificationType.PHONE_CHANGE,
          scope: VerificationScope.PHONE_CHANGE,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          usedAt: now,
        },
      });

      await tx.identityVerificationToken.create({
        data: {
          userId,
          type: VerificationType.PHONE_CHANGE,
          scope: VerificationScope.PHONE_CHANGE,
          tokenHash: token.hash,
          target: normalizedPhone,
          expiresAt,
        },
      });
    });
  } catch (err) {
    this.logger.error(
      '[PHONE_CHANGE_TOKEN_TX_FAILED]',
      err,
    );

    throw new BadRequestException(
      'Unable to process phone change request',
    );
  }

  // =================================================
  // 7) Send SMS (infra layer)
  // =================================================
  try {
    await this.phoneVerify.sendChangePhoneSMS({
      phone: normalizedPhone,
      token: token.raw,
    });
  } catch (err) {
    this.logger.error(
      '[PHONE_CHANGE_SMS_FAILED]',
      err,
    );

    // token ยัง valid อยู่ → user ขอ resend ได้
    try {
      await this.repo.createSecurityEvent({
        userId,
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        ip: meta?.ip,
        userAgent: meta?.userAgent,
      });
    } catch {}

    throw new BadRequestException(
      'Unable to send verification code',
    );
  }

  // =================================================
  // 8) Security Event
  // =================================================
  try {
    await this.repo.createSecurityEvent({
      userId,
      type: SecurityEventType.PHONE_CHANGE_REQUEST,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    });
  } catch {}

  // =================================================
  // 9) Audit Log
  // =================================================
  try {
    await this.auditLogService.log({
      userId,
      action: 'USER_PHONE_CHANGE_REQUEST',
      success: true,
    });
  } catch {}

  return { success: true };
 }


async confirmPhoneChange(
  userId: string,
  dto: ConfirmPhoneChangeDto,
  meta?: { ip?: string; userAgent?: string },
) {
  // =================================================
  // 1) Load user (authority)
  // =================================================
  const user = await this.repo.findUserForPhoneChange(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  // =================================================
  // 2) Policy check
  // =================================================
  ConfirmPhoneChangePolicy.assertCanConfirm({
    isDisabled: user.isDisabled,
    isBanned: user.isBanned,
    isAccountLocked: user.isAccountLocked,
  });

  // =================================================
  // 3) Hash token (server-side only)
  // =================================================
  const tokenHash = createHash('sha256')
    .update(dto.token)
    .digest('hex');

  // =================================================
  // 4) Load verification token
  // =================================================
  const tokenRecord =
    await this.repo.findPhoneChangeTokenByHash({
      userId,
      tokenHash,
    });

  if (!tokenRecord || !tokenRecord.target) {
  if (tokenRecord?.id) {
    try {
      await this.repo.incrementPhoneChangeAttempt(
        tokenRecord.id,
      );
    } catch {}
  }

  throw new BadRequestException(
    'Invalid or expired token',
  );
}


  // =================================================
  // 5) Expiry check (defensive)
  // =================================================
  if (tokenRecord.expiresAt < new Date()) {
    throw new BadRequestException('Token expired');
  }

  // =================================================
  // 6) Attempt limit (anti brute-force)
  // =================================================
  if (tokenRecord.attemptCount >= 5) {
    throw new BadRequestException(
      'Too many attempts. Please request again.',
    );
  }

  // =================================================
  // 7) Atomic consume (no reuse)
  // =================================================
  const consumed =
  await this.repo.consumePhoneChangeToken({
    tokenId: tokenRecord.id,
  });

if (!consumed) {
  try {
    await this.repo.incrementPhoneChangeAttempt(
      tokenRecord.id,
    );
  } catch {}

  throw new BadRequestException(
    'Token already used',
  );
}


  // =================================================
  // 8) Update phone + history (transactional)
  // =================================================
  await this.repo.updatePhoneWithHistory({
    userId,
    newPhone: tokenRecord.target,
  });

  // =================================================
  // 9) Security Event
  // =================================================
  try {
    await this.repo.createSecurityEvent({
      userId,
      type: SecurityEventType.PHONE_CHANGED,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    });
  } catch {}

  // =================================================
  // 10) Identity audit (fire-and-forget)
  // =================================================
  try {
    this.identityAudit.logPhoneChanged(userId);
  } catch {}

  // =================================================
  // 11) Compliance audit
  // =================================================
  try {
    await this.auditLogService.log({
      userId,
      action: 'USER_PHONE_CHANGED',
      success: true,
    });
  } catch {}

  return { success: true };
}


async confirmEmailChangeByToken(
  dto: ConfirmEmailChangeDto,
  meta?: { ip?: string; userAgent?: string },
) {
  if (!dto.token || typeof dto.token !== 'string') {
    throw new BadRequestException('Invalid verification token');
  }

  const tokenHash = createHash('sha256')
    .update(dto.token)
    .digest('hex');

  let result: { userId: string; newEmail: string } | null = null;

  try {
    result = await this.repo.confirmEmailChangeByTokenAtomic({
      tokenHash,
    });
  } catch (err: any) {
    this.logger.error('[EMAIL_CHANGE_CONFIRM_PUBLIC_TX_FAILED]', err);

    if (err?.code === 'P2002') {
      throw new ConflictException('Email already in use');
    }

    throw new BadRequestException('Unable to confirm email change');
  }

  if (!result) {
    throw new BadRequestException('Invalid or expired token');
  }

  // security event
  try {
    await this.repo.createSecurityEvent({
      userId: result.userId,
      type: SecurityEventType.EMAIL_CHANGED,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    });
  } catch {}

  // identity audit
  try {
    this.identityAudit.logEmailChanged(result.userId);
  } catch {}

  return { success: true };
}

async getMyTaggedPosts(params: {
  userId: string;
  limit?: number;
  cursor?: string;
}) {
  const { userId } = params;

  // =========================
  // 1) Load user state
  // =========================
  const user =
    await this.repo.findUserStateForTaggedPosts(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  // =========================
  // 2) Policy
  // =========================
  UserTaggedPostsViewPolicy.assertCanView({
    isDisabled: user.isDisabled,
    isBanned: user.isBanned,
  });

  const limit =
    UserTaggedPostsViewPolicy.normalizeLimit(
      params.limit,
    );

  // =========================
  // 3) Decode cursor (keyset)
  // =========================
  let cursorObj:
    | { createdAt: Date; id: string }
    | undefined = undefined;

  if (params.cursor) {
    try {
      const decoded = JSON.parse(
        Buffer.from(params.cursor, 'base64').toString(
          'utf8',
        ),
      );

      if (
        typeof decoded?.createdAt === 'string' &&
        typeof decoded?.id === 'string'
      ) {
        cursorObj = {
          createdAt: new Date(decoded.createdAt),
          id: decoded.id,
        };
      }
    } catch {
      throw new BadRequestException('Invalid cursor');
    }
  }

  // =========================
  // 4) DB authority query
  // =========================
  const rows = await this.repo.findMyTaggedPosts({
    userId,
    limit: limit + 1,
    cursor: cursorObj,
  });

  const hasNext = rows.length > limit;
  const sliced = hasNext ? rows.slice(0, limit) : rows;

  const nextCursor = hasNext
    ? Buffer.from(
        JSON.stringify({
          createdAt:
            sliced[sliced.length - 1].createdAt.toISOString(),
          id: sliced[sliced.length - 1].id,
        }),
      ).toString('base64')
    : null;

  return {
    items: sliced.map((r) =>
      MyTaggedPostFeedItemDto.fromEntity(r),
    ),
    nextCursor,
  };
}


async updateMyTagSettings(params: {
  userId: string;
  dto: {
    allowTagFrom?: any;
    requireApproval?: boolean;
  };
}) {
  const { userId, dto } = params;

  // =========================
  // 1) Load user state (DB authority)
  // =========================
  const user =
    await this.repo.findUserStateForTagSettings(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  // =========================
  // 2) Policy
  // =========================
  UserTagSettingsUpdatePolicy.assertCanUpdate({
    isDisabled: user.isDisabled,
    isBanned: user.isBanned,
    isAccountLocked: user.isAccountLocked,
  });

  const sanitized =
    UserTagSettingsUpdatePolicy.sanitize(dto);

  // =========================
  // 3) Persist (authority)
  // =========================
 const updated =
  await this.repo.upsertUserTagSetting({
    userId,
    allowTagFrom: sanitized.allowTagFrom,
    requireApproval: sanitized.requireApproval,
  });


  // =========================
  // 4) Audit (fail-soft)
  // =========================
  this.tagSettingsAudit.logUpdated({
    userId,
    fields: Object.keys(sanitized),
  });

  return TagSettingsResponseDto.fromEntity(updated);
}

async getMyTagSettings(params: { userId: string }) {
  const { userId } = params;

  // =========================
  // 1) Load user state
  // =========================
  const user =
    await this.repo.findUserStateForTagSettings(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  // =========================
  // 2) Policy
  // =========================
  UserTaggedPostsViewPolicy.assertCanView({
    isDisabled: user.isDisabled,
    isBanned: user.isBanned,
  });

  // =========================
  // 3) Load settings (DB authority)
  // =========================
  const setting =
    await this.repo.findUserTagSetting(userId);

  if (!setting) {
    // default behavior (same as upsert default)
    return {
      allowTagFrom: 'ANYONE',
      requireApproval: false,
    };
  }

  return TagSettingsResponseDto.fromEntity(setting);
}

}


