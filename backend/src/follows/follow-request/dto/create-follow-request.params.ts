// backend/src/follows/follow-request/dto/create-follow-request.params.ts

import { IsUUID } from 'class-validator';

export class CreateFollowRequestParams {
  @IsUUID()
  targetUserId!: string;
}
