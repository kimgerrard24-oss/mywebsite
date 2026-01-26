// backend/src/posts/dto/create-post.dto.ts

import {
  IsArray,
  IsOptional,
  IsString,
  Length,
  ArrayMaxSize,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { PostVisibility } from '@prisma/client';

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

  // =========================
  // Post visibility
  // =========================
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  // =========================
  // CUSTOM visibility rules
  // =========================
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200) // production-safe cap
  @IsString({ each: true })
  includeUserIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  excludeUserIds?: string[];

  // =========================
  // Friend Tagging
  // =========================
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10) // production-safe: limit tags per post
  @IsUUID('4', { each: true })
  taggedUserIds?: string[];
}

