// backend/src/admin/moderation/follows/dto/force-remove-follow.dto.ts

import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export enum ForceRemoveFollowReason {
  HARASSMENT = 'HARASSMENT',
  SPAM = 'SPAM',
  SCAM = 'SCAM',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  OTHER = 'OTHER',
}

export class ForceRemoveFollowDto {
  @IsEnum(ForceRemoveFollowReason)
  reason!: ForceRemoveFollowReason;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  note?: string;
}
