// backend/src/users/user-block/user-block.service.ts
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserBlockRepository } from './user-block.repository';
import { UserBlockPolicy } from './policy/user-block.policy';
import { NotificationCacheService } from '../../notifications/cache/notification-cache.service';

@Injectable()
export class UserBlockService {
  constructor(
    private readonly repo: UserBlockRepository,
    private readonly policy: UserBlockPolicy,
    private readonly notificationcache: NotificationCacheService, 
  ) {}

  async blockUser(params: {
    blockerId: string;
    targetUserId: string;
  }) {
    const { blockerId, targetUserId } = params;

    // 1) target must exist
    const target =
      await this.repo.findTargetUserForBlock(
        targetUserId,
      );

    if (!target) {
      throw new NotFoundException(
        'User not found',
      );
    }

    // 2) policy validation
    this.policy.assertCanBlock({
      blockerId,
      targetUserId,
      isTargetDisabled: target.isDisabled,
    });

    // 3) prevent duplicate block
    await this.repo.assertNotAlreadyBlocked({
      blockerId,
      blockedId: targetUserId,
    });

    // 4) create block relation (DB = authority)
    await this.repo.createBlock({
      blockerId,
      blockedId: targetUserId,
    });

    // ✅ 5) invalidate notification cache (Redis)
    await this.notificationcache.invalidateList(
      blockerId,
    );

    /**
     * optional extensions:
     * - invalidate other domain caches (feed, follow, chat)
     * - realtime side effects (if needed in future)
     *
     * rule: DB → Redis → Realtime
     */
  }

  // ===== unblock =====
  async unblockUser(params: {
    blockerId: string;
    targetUserId: string;
  }) {
    const { blockerId, targetUserId } = params;

    this.policy.assertCanUnblock({
      blockerId,
      targetUserId,
    });

    const exists = await this.repo.blockExists({
      blockerId,
      blockedId: targetUserId,
    });

    this.policy.assertBlockExists(exists);

    // 1) delete block (DB = authority)
    await this.repo.deleteBlock({
      blockerId,
      blockedId: targetUserId,
    });

    // ✅ 2) invalidate notification cache (Redis)
    await this.notificationcache.invalidateList(
      blockerId,
    );

    /**
     * optional extension:
     * - invalidate feed cache
     * - refresh follow suggestion
     *
     * rule: DB → Redis → Realtime
     */
  }

  async getMyBlockedUsers(params: {
    requesterId: string;
    cursor?: string;
    limit?: number;
  }): Promise<{
    items: Array<{
      id: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
      blockedAt: string;
    }>;
    nextCursor: string | null;
  }> {
    const {
      requesterId,
      cursor,
      limit = 20,
    } = params;

    this.policy.assertCanViewMyBlocks({
      requesterId,
    });

    const res =
      await this.repo.findMyBlockedUsers({
        blockerId: requesterId,
        cursor,
        limit,
      });

    const hasMore = res.items.length > limit;
    const sliced = hasMore
      ? res.items.slice(0, limit)
      : res.items;

    const nextCursor = hasMore
      ? sliced[sliced.length - 1].blockedId
      : null;

    return {
      items: sliced.map((r) => ({
        id: r.user.id,
        username: r.user.username,
        displayName: r.user.displayName,
        avatarUrl: r.user.avatarUrl,
        blockedAt: r.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }
}

