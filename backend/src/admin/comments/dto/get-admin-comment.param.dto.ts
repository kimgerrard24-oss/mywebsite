// backend/src/admin/comments/dto/get-admin-comment.param.dto.ts

import { IsUUID } from 'class-validator';

export class GetAdminCommentParamDto {
  @IsUUID()
  id!: string;
}
