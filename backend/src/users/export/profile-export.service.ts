// backend/src/users/export/profile-export.service.ts

import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { ProfileExportRepository } from './profile-export.repository';
import { ProfileExportPolicy } from './policies/profile-export.policy';
import { ProfileExportDto } from './dto/profile-export.dto';
import { UsersRepository } from '../users.repository';
import { AuditLogService } from '../audit/audit-log.service';
import { SecurityEventType } from '@prisma/client';
import { CredentialVerificationService } from '../../auth/credential-verification.service';

@Injectable()
export class ProfileExportService {
  constructor(
    private readonly repo: ProfileExportRepository,
    private readonly usersRepo: UsersRepository,
    private readonly auditLog: AuditLogService,
    private readonly credentialVerify: CredentialVerificationService,
  ) {}

  /**
   * Export full user profile & activity data
   * Security level: authenticated + policy guarded
   * Backend = authority
   */
 async exportProfile(params: {
  userId: string;
  jti: string;
}) {
  const { userId, jti } = params;

  // =================================================
  // 1) Load user security state (DB authority)
  // =================================================
  const user =
    await this.usersRepo.findUserSecurityState(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  // =================================================
  // 2) Business policy
  // =================================================
  ProfileExportPolicy.assertCanExport({
    isDisabled: user.isDisabled,
    isBanned: user.isBanned,
    isAccountLocked: user.isAccountLocked,
  });

  // =================================================
  // 3) Verified sensitive session (single-use)
  // =================================================
  const isVerified =
    await this.credentialVerify.consumeVerifiedSession({
      jti,
      scope: 'PROFILE_EXPORT',
      userId,
    });

  if (!isVerified) {
    throw new ForbiddenException(
      'Sensitive verification required',
    );
  }

  // =================================================
  // 4) Aggregate export data
  // =================================================
  const data = await this.repo.aggregateUserData(userId);

  if (!data) {
    throw new BadRequestException(
      'Export data not found',
    );
  }

  const payload = ProfileExportDto.fromEntity(data);

  if (!payload) {
    throw new BadRequestException(
      'Export payload generation failed',
    );
  }

  // =================================================
  // 5) Compliance audit (fail-soft)
  // =================================================
  try {
    await this.auditLog.log({
      userId,
      action: 'USER_PROFILE_EXPORT',
      success: true,
    });
  } catch {}

  // =================================================
  // 6) Security event (fail-soft)
  // =================================================
  try {
    await this.usersRepo.createSecurityEvent({
      userId,
      type: SecurityEventType.PROFILE_EXPORTED,
    });
  } catch {}

  // =================================================
  // 7) Prepare structured export files
  // =================================================
  return {
    exportedAt: new Date().toISOString(),
    files: {
      'profile.json': payload.profile,
      'posts.json': payload.posts ?? [],
      'comments.json': payload.comments ?? [],
      'security-events.json':
        payload.securityEvents ?? [],
    },
  };
}


}
