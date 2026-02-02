// backend/src/reposts/dto/create-repost.dto.ts

import { IsUUID } from 'class-validator';

export class CreateRepostDto {
  @IsUUID()
  postId!: string;
}
