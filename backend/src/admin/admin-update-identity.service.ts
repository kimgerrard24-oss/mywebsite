// backend/src/admin/admin-update-identity.service.ts

import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { UserModerationRepository } from './../moderation/user/user-moderation.repository';
import { AdminIdentityOverridePolicy } from './admin-identity-override.policy';
import { AdminActionLogService } from './audit/admin-action-log.service';
import { RevokeUserSessionsService } from '../auth/services/revoke-user-sessions.service';

@Injectable()
export class AdminUpdateIdentityService {
  constructor(
    private readonly repo: UserModerationRepository,
    private readonly audit: AdminActionLogService,
    private readonly revokeSessions: RevokeUserSessionsService,
  ) {}

  async updateIdentity(params: {
    adminId: string;              
    targetUserId: string;
    payload: {
      username?: string;
      email?: string;
      phoneNumber?: string;
      reason: string;
    };
    ip?: string;
  }) {
    const { adminId, targetUserId, payload, ip } = params;

    AdminIdentityOverridePolicy.assertPayloadValid(payload);

    const { reason, ...updates } = payload;

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException(
        'No identity fields to update',
      );
    }

    await this.repo.updateIdentityWithHistory({
      targetUserId,
      updates,
      adminId,
    });

    await this.revokeSessions.revokeAll(targetUserId);

    await this.audit.log({
      adminId,
      targetUserId,
      action: 'ADMIN_UPDATE_IDENTITY',
      detail: {
        reason,
        updatedFields: Object.keys(updates),
      },
      ip,
    });

    return {
      success: true,
      updatedFields: Object.keys(updates),
    };
  }
}
