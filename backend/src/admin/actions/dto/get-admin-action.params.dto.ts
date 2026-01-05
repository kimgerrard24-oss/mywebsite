// backend/src/admin/actions/dto/get-admin-action.params.dto.ts

import { IsUUID } from 'class-validator';

export class GetAdminActionParamsDto {
  @IsUUID()
  id!: string;
}
