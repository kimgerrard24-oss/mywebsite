// backend/src/users/dto/search-users.query.dto.ts
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SearchUsersQueryDto {
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value.trim())
  query!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 10;
}


