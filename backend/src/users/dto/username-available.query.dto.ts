// backend/src/users/dto/username-available.query.dto.ts

import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UsernameAvailableQueryDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(3, 20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username must be alphanumeric or underscore only',
  })
  u!: string;
}
