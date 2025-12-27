// backend/src/chat/dto/create-chat-report.dto.ts
import { ChatReportReason } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatReportDto {
  @IsEnum(ChatReportReason)
  reason!: ChatReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
