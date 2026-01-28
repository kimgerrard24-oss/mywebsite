// backend/src/shares/dto/create-share.dto.ts

import {
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateShareDto {
  @IsUUID()
  postId!: string;

  @ValidateIf((o) => !o.targetChatId)
  @IsUUID()
  targetUserId?: string;

  @ValidateIf((o) => !o.targetUserId)
  @IsUUID()
  targetChatId?: string;
}
