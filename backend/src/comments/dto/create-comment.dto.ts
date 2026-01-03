import {
  IsString,
  Length,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  IsUUID,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @Length(1, 1000)
  content!: string;

  /**
   * userIds ที่ถูก mention
   * - optional
   * - validate ขั้นต้นเท่านั้น
   * - business logic อยู่ที่ service
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20) // กัน spam mention
  @IsUUID('4', { each: true })
  mentions?: string[];
}
