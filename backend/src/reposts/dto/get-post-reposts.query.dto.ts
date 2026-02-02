// backend/src/reposts/dto/get-post-reposts.query.dto.ts

import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class GetPostRepostsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
