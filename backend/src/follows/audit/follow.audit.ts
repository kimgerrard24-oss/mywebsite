// backend/src/follows/audit/follow.audit.ts
import { Injectable } from '@nestjs/common';
import { AuditService } from '../../auth/audit.service';

@Injectable()
export class FollowAudit {

  constructor(
    private readonly audit: AuditService,
  ) {}

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

  async recordBlockedAttempt(params: {
  followerId: string;
  followingId: string;
}) {
  await this.audit.createLog({
    userId: params.followerId,
    action: 'follow.blocked_attempt',
    success: false,
    targetId: params.followingId,
    reason: 'blocked_relation',
  });
}

async recordDuplicateAttempt(params: {
  followerId: string;
  followingId: string;
}) {
  await this.audit.createLog({
    userId: params.followerId,
    action: 'follow.duplicate_attempt',
    success: false,
    targetId: params.followingId,
    reason: 'already_following',
  });
}

async recordInvalidUnfollowAttempt(params: {
  followerId: string;
  followingId: string;
}) {
  await this.audit.createLog({
    userId: params.followerId,
    action: 'unfollow.invalid_attempt',
    success: false,
    targetId: params.followingId,
    reason: 'not_following',
  });
}

}
