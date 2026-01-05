// backend/src/admin/report/dto/get-admin-report.param.dto.ts

import { IsUUID } from 'class-validator';

export class GetAdminReportParamDto {
  @IsUUID()
  id!: string;
}
