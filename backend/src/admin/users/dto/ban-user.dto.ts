// backend/src/admin/users/dto/ban-user.dto.ts

import { IsString, MinLength } from 'class-validator';

export class BanUserDto {
  @IsString()
  @MinLength(3)
  reason!: string;
}
