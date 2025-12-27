// backend/src/chat/dto/delete-chat-message.dto.ts

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeleteChatMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
