// backend/src/admin/posts/dto/get-admin-post.param.dto.ts

import { IsUUID } from 'class-validator';

export class GetAdminPostParamDto {
  @IsUUID()
  id!: string;
}
