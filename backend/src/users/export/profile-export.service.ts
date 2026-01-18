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

    const isVerified =
  await this.credentialVerify.consumeVerifiedSession({
    jti,
    scope: 'PROFILE_EXPORT',
  });

if (!isVerified) {
  throw new ForbiddenException(
    'Sensitive verification required',
  );
}


    // =================================================
    // 3) Aggregate export data
    // =================================================
    const data = await this.repo.aggregateUserData(userId);

    if (!data) {
      throw new BadRequestException(
        'Export data not found',
      );
    }

    const payload = ProfileExportDto.fromEntity(data);

    // =================================================
    // 4) Compliance audit (fail-soft)
    // =================================================
    try {
      await this.auditLog.log({
        userId,
        action: 'USER_PROFILE_EXPORT',
        success: true,
      });
    } catch {
      // must not affect export flow
    }

    // =================================================
    // 5) Security event (fail-soft)
    // =================================================
    try {
      await this.usersRepo.createSecurityEvent({
        userId,
        type: SecurityEventType.PROFILE_EXPORTED, 
      });
    } catch {
      // must not affect export flow
    }

    // =================================================
    // 6) Response
    // =================================================
    return {
      exportedAt: new Date().toISOString(),
      data: payload,
    };
  }
}
