// backend/src/reports/dto/withdraw-report.param.dto.ts

import { IsString } from 'class-validator';

export class WithdrawReportParamDto {
  @IsString()
  id!: string;
}
