// backend/src/admin/users/dto/get-admin-user.param.dto.ts

import { IsUUID } from 'class-validator';

export class GetAdminUserParamDto {
  @IsUUID()
  id!: string;
}
