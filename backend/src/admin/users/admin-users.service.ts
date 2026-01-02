// backend/src/admin/users/admin-users.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminUsersRepository } from './admin-users.repository';
import { GetAdminUsersQueryDto } from './dto/get-admin-users.query.dto';
import { AdminAuditService } from '../audit/admin-audit.service';
import { RevokeUserSessionsService } from '../../auth/services/revoke-user-sessions.service';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly repo: AdminUsersRepository,
    private readonly audit: AdminAuditService,
    private readonly revokeSessions: RevokeUserSessionsService,
  ) {}

  async getUsers(query: GetAdminUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim() || null;

    const [items, total] =
      await this.repo.findUsers({
        page,
        limit,
        search,
      });

    return {
      items,
      page,
      limit,
      total,
    };
  }

   async banUser(params: {
    targetUserId: string;
    reason: string;
  }) {
    const { targetUserId, reason } = params;

    const user = await this.repo.findById(targetUserId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException(
        'Cannot ban admin user',
      );
    }

    if (user.isDisabled) {
      return; // idempotent
    }

    await this.repo.banUser({
      userId: targetUserId,
      reason,
    });

    // 🔒 revoke all active sessions (Redis authority)
    await this.revokeSessions.revokeAll(targetUserId);

    // 🧾 audit log
    await this.audit.log({
      action: 'BAN_USER',
      targetId: targetUserId,
      detail: { reason },
    });
  }
}
