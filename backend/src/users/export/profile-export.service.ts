// backend/src/users/export/profile-export.service.ts

import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { ProfileExportRepository } from './profile-export.repository';
import { ProfileExportPolicy } from './policies/profile-export.policy';
import { ProfileExportDto } from './dto/profile-export.dto';
import { UsersRepository } from '../users.repository';
import { AuditLogService } from '../audit/audit-log.service';
import { SecurityEventType } from '@prisma/client';

@Injectable()
export class ProfileExportService {
  constructor(
    private readonly repo: ProfileExportRepository,
    private readonly usersRepo: UsersRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async exportProfile(userId: string) {
    const user =
      await this.usersRepo.findUserSecurityState(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    ProfileExportPolicy.assertCanExport({
      isDisabled: user.isDisabled,
      isBanned: user.isBanned,
      isAccountLocked: user.isAccountLocked,
    });

    const data = await this.repo.aggregateUserData(
      userId,
    );

    const payload = ProfileExportDto.fromEntity(
      data,
    );

    // ===============================
    // ✅ AUDIT + SECURITY EVENT
    // ===============================
    try {
      await this.auditLog.log({
        userId,
        action: 'USER_PROFILE_EXPORT',
        success: true,
      });
    } catch {}

    try {
      await this.usersRepo.createSecurityEvent({
        userId,
        type: SecurityEventType.CREDENTIAL_VERIFIED, // reuse sensitive action
      });
    } catch {}

    return {
      exportedAt: new Date().toISOString(),
      data: payload,
    };
  }
}
