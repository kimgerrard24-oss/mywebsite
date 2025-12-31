// backend/src/comments/replies/dto/create-reply.dto.ts

import { IsString, MaxLength } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @MaxLength(1000)
  content!: string;
}
