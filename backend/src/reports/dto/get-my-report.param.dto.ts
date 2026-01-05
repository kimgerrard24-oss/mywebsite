// backend/src/reports/dto/get-my-report.param.dto.ts

import { IsString } from 'class-validator';

export class GetMyReportParamDto {
  @IsString()
  id!: string;
}
