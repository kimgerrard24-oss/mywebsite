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
import { AdminUserDetailDto } from './dto/admin-user-detail.dto';
import { AdminUserPolicy } from './policy/admin-user.policy';

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
  banned: boolean;
  reason?: string;
}) {
  const { targetUserId, banned, reason } = params;

  /**
   * 1️⃣ Load target user (DB = authority)
   */
  const user = await this.repo.findById(targetUserId);

  if (!user) {
    // (optional) audit not-found attempt
    try {
      await this.audit.log({
        action: 'BAN_USER_TARGET_NOT_FOUND',
        targetId: targetUserId,
      });
    } catch {}

    throw new NotFoundException('User not found');
  }

  /**
   * 2️⃣ Safety rule
   * - ADMIN ห้ามถูกจัดการผ่าน admin-ban API นี้
   */
  if (user.role === 'ADMIN') {
    try {
      await this.audit.log({
        action: 'BAN_USER_BLOCKED_ADMIN_TARGET',
        targetId: targetUserId,
      });
    } catch {}

    throw new ForbiddenException(
      'Cannot manage admin user',
    );
  }

  /**
   * =========================
   * 3️⃣ UNBAN FLOW
   * =========================
   * Authority = isBanned
   */
  if (banned === false) {
    // idempotent → not banned already
    if (!user.isBanned) {
      try {
        await this.audit.log({
          action: 'UNBAN_USER_NOOP_ALREADY_ACTIVE',
          targetId: targetUserId,
        });
      } catch {}

      return;
    }

    await this.repo.unbanUser(targetUserId);

    /**
     * 🧾 audit log
     * - unban ไม่ revoke session
     */
    try {
      await this.audit.log({
        action: 'UNBAN_USER',
        targetId: targetUserId,
      });
    } catch {}

    return;
  }

  /**
   * =========================
   * 4️⃣ BAN FLOW
   * =========================
   */

  // idempotent → already banned
  if (user.isBanned) {
    try {
      await this.audit.log({
        action: 'BAN_USER_NOOP_ALREADY_BANNED',
        targetId: targetUserId,
      });
    } catch {}

    return;
  }

  // defensive check
  if (!reason || reason.trim().length < 3) {
    try {
      await this.audit.log({
        action: 'BAN_USER_BLOCKED_INVALID_REASON',
        targetId: targetUserId,
      });
    } catch {}

    throw new ForbiddenException(
      'Ban reason is required',
    );
  }

  await this.repo.banUser({
    userId: targetUserId,
    reason: reason.trim(),
  });

  /**
   * 🔒 Redis authority
   * - revoke session ทันที
   * - ไม่ reset TTL
   */
  await this.revokeSessions.revokeAll(targetUserId);

  /**
   * 🧾 audit log
   */
  try {
    await this.audit.log({
      action: 'BAN_USER',
      targetId: targetUserId,
      detail: {
        reason: reason.trim(),
      },
    });
  } catch {}
}


  async getUserById(
    userId: string,
  ): Promise<AdminUserDetailDto> {
    const user =
      await this.repo.findUserById(userId);

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    AdminUserPolicy.assertReadable(user);

    return AdminUserDetailDto.from(user);
  }

}
