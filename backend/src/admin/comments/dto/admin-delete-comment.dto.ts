// backend/src/admin/comments/dto/admin-delete-comment.dto.ts

import { IsString, IsOptional, MaxLength } from 'class-validator';

export class AdminDeleteCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
