// backend/src/chat/dto/create-chat-message.dto.ts
import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string;
}
