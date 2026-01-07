import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetMyReportsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;

  /**
   * Defensive default (backend authority)
   * Ensures limit is always valid even if DTO transform is bypassed
   */
  constructor(partial?: Partial<GetMyReportsQueryDto>) {
    Object.assign(this, partial);

    if (
      typeof this.limit !== 'number' ||
      !Number.isInteger(this.limit) ||
      this.limit < 1 ||
      this.limit > 50
    ) {
      this.limit = 20;
    }
  }
}
