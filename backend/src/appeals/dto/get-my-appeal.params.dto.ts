// backend/src/appeals/dto/get-my-appeal.params.dto.ts

import { IsUUID } from 'class-validator';

export class GetMyAppealParamsDto {
  @IsUUID()
  id!: string;
}
