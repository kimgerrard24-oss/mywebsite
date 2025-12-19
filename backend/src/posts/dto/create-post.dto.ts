// backend/src/posts/dto/create-post.dto.ts
import {
  IsArray,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Length(1, 2000, {
    message: 'Post content must be between 1 and 2000 characters',
  })
  @MaxLength(500)
  content!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10) // จำกัด media ต่อโพสต์ (policy layer จะเช็คซ้ำ)
  @IsString({ each: true })
  mediaIds?: string[];
}
