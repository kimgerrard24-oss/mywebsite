// backend/src/reposts/dto/delete-repost.params.dto.ts

import { IsUUID } from 'class-validator';

export class DeleteRepostParamsDto {
  @IsUUID()
  postId!: string;
}
