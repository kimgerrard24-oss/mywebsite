// backend/src/profile-media/dto/get-profile-media.query.dto.ts

import { IsOptional, IsEnum, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { ProfileMediaType } from "@prisma/client";

export class GetProfileMediaQueryDto {
  @IsOptional()
  @IsEnum(ProfileMediaType)
  type?: ProfileMediaType;

  @IsOptional()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
