// backend/src/admin/shares/dto/disable-share.dto.ts

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class DisableShareDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}
