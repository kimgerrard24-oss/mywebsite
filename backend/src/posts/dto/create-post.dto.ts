// backend/src/posts/dto/create-post.dto.ts

import {
  IsArray,
  IsOptional,
  IsString,
  Length,
  ArrayMaxSize,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Length(1, 2000, {
    message: 'Post content must be between 1 and 2000 characters',
  })
  content!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  mediaIds?: string[];
}
