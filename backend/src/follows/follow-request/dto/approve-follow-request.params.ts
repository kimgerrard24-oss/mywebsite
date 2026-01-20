// backend/src/follows/follow-request/dto/approve-follow-request.params.ts

import { IsUUID } from 'class-validator';

export class ApproveFollowRequestParams {
  @IsUUID()
  requestId!: string;
}
