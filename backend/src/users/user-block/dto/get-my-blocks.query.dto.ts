// backend/src/users/user-block/dto/get-my-blocks.query.dto.ts

import {
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetMyBlocksQueryDto {
  /**
   * cursor = last item id (UserBlock.blockedId)
   */
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
