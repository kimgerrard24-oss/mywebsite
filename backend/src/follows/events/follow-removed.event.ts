// backend/src/follows/events/follow-removed.event.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class FollowRemovedEvent {
  async emit(params: {
    followerId: string;
    followingId: string;
  }) {
    // hook สำหรับ notification / activity removal
    // intentionally no-op (production ready)
  }
}
