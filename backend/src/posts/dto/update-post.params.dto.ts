// backend/src/posts/dto/update-post.params.dto.ts
import { IsUUID } from 'class-validator';

export class UpdatePostParamsDto {
  @IsUUID()
  id!: string;
}
