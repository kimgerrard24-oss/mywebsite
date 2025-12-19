// backend/src/posts/dto/delete-post.params.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';


 export class DeletePostParamsDto {
   @IsString()
   @IsNotEmpty()
   id!: string;
}