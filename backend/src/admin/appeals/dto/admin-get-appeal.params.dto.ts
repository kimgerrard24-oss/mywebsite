// backend/src/admin/appeals/dto/admin-get-appeal.params.dto.ts

import { IsUUID } from 'class-validator';

export class AdminGetAppealParamsDto {
  @IsUUID()
  id!: string;
}

