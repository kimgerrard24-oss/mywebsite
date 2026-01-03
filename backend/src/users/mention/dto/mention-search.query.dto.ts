// backend/src/users/mention/dto/mention-search.query.dto.ts

import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class MentionSearchQueryDto {
  /**
   * คำที่พิมพ์หลัง @
   * - บังคับขั้นต่ำ 1 ตัว
   * - ป้องกัน scan / abuse
   */
  @IsString()
  @MinLength(1)
  q!: string;

  /**
   * จำกัดจำนวนผลลัพธ์
   * - default: 10
   * - max: 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 10;
}
