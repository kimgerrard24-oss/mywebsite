// backend/src/posts/dto/create-post.dto.ts
import { IsString, Length } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Length(1, 2000, {
    message: 'Post content must be between 1 and 2000 characters',
  })
  content!: string;
}
