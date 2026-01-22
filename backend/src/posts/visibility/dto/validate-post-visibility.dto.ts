// backend/src/posts/visibility/dto/validate-post-visibility.dto.ts

import { IsString, IsUUID } from 'class-validator';

export class ValidatePostVisibilityDto {
  @IsUUID()
  postId!: string;
}
