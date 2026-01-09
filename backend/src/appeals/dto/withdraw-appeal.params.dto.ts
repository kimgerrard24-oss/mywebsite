// backend/src/appeals/dto/withdraw-appeal.params.dto.ts

import { IsUUID } from 'class-validator';

export class WithdrawAppealParamsDto {
  @IsUUID()
  id!: string;
}
