// backend/src/admin/posts/dto/delete-admin-post.dto.ts

import { IsString, MinLength } from 'class-validator';

export class DeleteAdminPostDto {
  @IsString()
  @MinLength(3)
  reason!: string;
}
