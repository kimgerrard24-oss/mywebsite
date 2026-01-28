// backend/src/shares/dto/share-intent.dto.ts

import { IsUUID } from 'class-validator';

export class ShareIntentDto {
  @IsUUID()
  postId!: string;
}
