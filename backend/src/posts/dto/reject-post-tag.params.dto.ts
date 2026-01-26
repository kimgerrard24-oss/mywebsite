// backend/src/posts/dto/reject-post-tag.params.dto.ts

import { IsUUID } from 'class-validator';

export class RejectPostTagParamsDto {
  @IsUUID()
  postId!: string;

  @IsUUID()
  tagId!: string;
}
