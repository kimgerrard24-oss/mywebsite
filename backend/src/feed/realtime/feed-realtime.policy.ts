// backend/src/feed/realtime/feed-realtime.policy.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedRealtimePolicy {
  /**
   * จำกัดว่า post หนึ่งอัน
   * ควร emit realtime ได้หรือไม่
   */
  allowEmit(post: {
    isPublic: boolean;
    createdAt: Date;
  }): boolean {
    if (!post.isPublic) return false;

    const ageMs =
      Date.now() - post.createdAt.getTime();

    // กัน post เก่า / backfill
    if (ageMs > 60_000) return false;

    return true;
  }
}
