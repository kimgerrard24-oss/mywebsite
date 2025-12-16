// backend/src/users/dto/search-users.query.dto.ts
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SearchUsersQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value.trim())
  query!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => Number(value ?? 10))
  limit: number = 10;
}

