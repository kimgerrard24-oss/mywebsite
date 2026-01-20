// backend/src/following/following.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { FollowingRepository } from './following.repository';
import { FollowingReadPolicy } from './policy/following-read.policy';
import { FollowingMapper } from './mapper/following.mapper';

@Injectable()
export class FollowingService {
  constructor(
    private readonly repo: FollowingRepository,
  ) {}

  async getFollowing(params: {
  userId: string;
  viewerUserId?: string | null;
  cursor?: string;
  limit?: number;
}) {
  const limit = params.limit ?? 20;

  // ==============================
  // 1) Load relation & privacy state
  // ==============================
  const relation = await this.repo.getFollowVisibilityState({
    targetUserId: params.userId,
    viewerUserId: params.viewerUserId ?? null,
  });

  if (!relation) {
    throw new ConflictException('USER_NOT_FOUND');
  }

  FollowingReadPolicy.assertCanReadFollowing({
    isPrivate: relation.isPrivate,
    isSelf: relation.isSelf,
    isFollowing: relation.isFollowing,
    isBlockedByTarget: relation.isBlockedByTarget,
    hasBlockedTarget: relation.hasBlockedTarget,
  });

  // ==============================
  // 2) Load following list
  // ==============================
  const rows = await this.repo.findFollowing({
    userId: params.userId,
    viewerUserId: params.viewerUserId ?? null,
    cursor: params.cursor,
    limit,
  });

  return FollowingMapper.toResponse(rows, limit);
}

}
