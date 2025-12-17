// backend/src/posts/dto/get-posts.query.dto.ts
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetPostsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit = 20;

  @IsString()
  @IsOptional()
  cursor?: string;
}
