// backend/src/search/dto/search-posts.query.dto.ts

import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class SearchPostsQueryDto {
  @IsString()
  @Length(1, 100)
  q!: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  /**
   * Cursor-based pagination (optional)
   * ใช้ createdAt หรือ id ก็ได้
   */
  @IsOptional()
  @IsString()
  cursor?: string;
}
