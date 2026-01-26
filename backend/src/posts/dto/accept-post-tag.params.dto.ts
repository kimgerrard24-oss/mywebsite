// backend/src/posts/dto/accept-post-tag.params.dto.ts

import { IsUUID } from 'class-validator';

export class AcceptPostTagParamsDto {
  @IsUUID()
  postId!: string;

  @IsUUID()
  tagId!: string;
}
