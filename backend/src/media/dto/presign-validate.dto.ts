// backend/src/media/dto/presign-validate.dto.ts
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PresignValidateDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsInt()
  @Min(1)
  @Max(50 * 1024 * 1024) // 50MB hard limit
  fileSize!: number;

  @IsIn(['image', 'video'])
  mediaType!: 'image' | 'video';
}
