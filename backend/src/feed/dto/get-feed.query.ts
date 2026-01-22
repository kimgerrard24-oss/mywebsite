// backend/src/feed/dto/get-feed.query.ts

import { IsInt, IsOptional, IsIn, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetFeedQuery {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsString()
  cursor?: string;

  /**
   * right-side video feed
   */
  @IsOptional()
  @IsIn(['video'])
  mediaType?: 'video';
}
