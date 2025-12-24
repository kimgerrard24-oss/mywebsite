// backend/src/follows/audit/follow.audit.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class FollowAudit {
  async record(params: {
    followerId: string;
    followingId: string;
  }) {
    // สำหรับ moderation / compliance
    // log หรือส่งไป external system ได้
  }

  async recordUnfollow(params: {
    followerId: string;
    followingId: string;
  }) {
    // audit สำหรับ unfollow
  }
}
