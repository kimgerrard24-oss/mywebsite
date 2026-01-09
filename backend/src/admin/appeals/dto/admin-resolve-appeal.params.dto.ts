// backend/src/admin/appeals/dto/admin-resolve-appeal.params.dto.ts

import { IsUUID } from 'class-validator';

export class AdminResolveAppealParamsDto {
  @IsUUID()
  id!: string;
}
