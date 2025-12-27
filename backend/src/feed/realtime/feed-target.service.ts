// backend/src/feed/realtime/feed-target.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeedTargetService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Resolve target user IDs
   * ❗ ใช้ algorithm เดียวกับ feed จริง
   */
  async resolveTargets(
    authorId: string,
  ): Promise<string[]> {
    const followers =
      await this.prisma.follow.findMany({
        where: { followingId: authorId },
        select: { followerId: true },
      });

    return followers.map(
      (f) => f.followerId,
    );
  }
}
