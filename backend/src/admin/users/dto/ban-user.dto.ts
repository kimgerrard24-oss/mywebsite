// backend/src/admin/users/dto/ban-user.dto.ts

import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class BanUserDto {
  /**
   * true  = ban
   * false = unban
   */
  @IsBoolean()
  banned!: boolean;

  /**
   * reason จำเป็นเฉพาะตอน ban
   */
  @ValidateIf((o) => o.banned === true)
  @IsString()
  @MinLength(3)
  reason?: string;
}
