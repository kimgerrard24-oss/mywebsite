// backend/src/chat/dto/create-chat-message.dto.ts
import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateChatMessageDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content?: string;

  /**
   * media attachments (image / voice)
   * - ส่งเป็น mediaId ที่ upload เสร็จแล้ว
   */
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  mediaIds?: string[];
}
