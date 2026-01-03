// backend/src/comments/replies/dto/create-reply.dto.ts

import {
  IsString,
  MaxLength,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateReplyDto {
  /**
   * Reply content
   */
  @IsString()
  @MaxLength(1000)
  content!: string;

  /**
   * Mentioned user IDs
   * - optional
   * - UUID v4 only
   * - validated at DTO layer (fail-fast)
   */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  mentions?: string[];
}
