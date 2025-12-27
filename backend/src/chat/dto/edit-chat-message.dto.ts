// backend/src/chat/dto/edit-chat-message.dto.ts

import { IsString, MaxLength, MinLength } from 'class-validator';

export class EditChatMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
