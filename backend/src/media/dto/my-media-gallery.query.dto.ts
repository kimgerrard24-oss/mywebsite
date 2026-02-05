// =======================================
// backend/src/media/dto/my-media-gallery.query.dto.ts
// =======================================

import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum MyMediaTypeFilter {
  ALL = 'all',
  IMAGE = 'image',
  VIDEO = 'video',
}

export class MyMediaGalleryQueryDto {
  @IsOptional()
  @IsEnum(MyMediaTypeFilter)
  type: MyMediaTypeFilter = MyMediaTypeFilter.ALL;

  @IsOptional()
  @IsString()
  cursor?: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(30)
  limit: number = 24;
}