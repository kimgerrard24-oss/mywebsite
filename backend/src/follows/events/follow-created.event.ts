// backend/src/follows/events/follow-created.event.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class FollowCreatedEvent {
  async emit(params: {
    followerId: string;
    followingId: string;
  }) {
    // hook สำหรับ notification / activity feed
    // ตอนนี้ intentionally no-op
  }
}
