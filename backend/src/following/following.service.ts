// backend/src/following/following.service.ts
import { Injectable } from '@nestjs/common';
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
    cursor?: string;
    limit?: number;
  }) {
    FollowingReadPolicy.assertCanReadFollowing({
      userId: params.userId,
    });

    const limit = params.limit ?? 20;

    const rows = await this.repo.findFollowing({
      userId: params.userId,
      cursor: params.cursor,
      limit,
    });

    return FollowingMapper.toResponse(rows, limit);
  }
}
