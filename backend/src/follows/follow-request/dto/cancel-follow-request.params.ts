// backend/src/follows/follow-request/dto/cancel-follow-request.params.ts

import { IsUUID } from 'class-validator';

export class CancelFollowRequestParams {
  @IsUUID()
  targetUserId!: string;
}
