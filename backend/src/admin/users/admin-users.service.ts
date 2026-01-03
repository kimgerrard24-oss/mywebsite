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
  banned: boolean;
  reason?: string;
}) {
  const { targetUserId, banned, reason } = params;

  /**
   * 1️⃣ Load target user (DB = authority)
   */
  const user = await this.repo.findById(targetUserId);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  /**
   * 2️⃣ Safety rule
   * - ADMIN ห้ามถูกจัดการผ่าน admin-ban API นี้
   */
  if (user.role === 'ADMIN') {
    throw new ForbiddenException(
      'Cannot manage admin user',
    );
  }

  /**
   * =========================
   * 3️⃣ UNBAN FLOW
   * =========================
   * Authority = isDisabled
   */
  if (banned === false) {
    // ไม่ได้ถูกแบนอยู่แล้ว → idempotent
    if (!user.isDisabled) {
      return;
    }

    await this.repo.unbanUser(targetUserId);

    // 🧾 audit log (unban ไม่ revoke session)
    await this.audit.log({
      action: 'UNBAN_USER',
      targetId: targetUserId,
    });

    return;
  }

  /**
   * =========================
   * 4️⃣ BAN FLOW
   * =========================
   */

  // ถูกแบนอยู่แล้ว → idempotent
  if (user.isDisabled) {
    return;
  }

  // defensive check (DTO ควร block ไว้แล้ว)
  if (!reason || reason.trim().length < 3) {
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
  await this.revokeSessions.revokeAll(
    targetUserId,
  );

  /**
   * 🧾 audit log
   */
  await this.audit.log({
    action: 'BAN_USER',
    targetId: targetUserId,
    detail: {
      reason: reason.trim(),
    },
  });
}



}
