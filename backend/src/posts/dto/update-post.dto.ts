// backend/src/posts/dto/update-post.dto.ts
import {
  IsString,
  Length,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @Length(1, 2000, {
    message: 'Post content must be between 1 and 2000 characters',
  })
  content!: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  keepMediaIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mediaIds?: string[];
}
