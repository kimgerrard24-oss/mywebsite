// backend/src/media/dto/media-complete.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class MediaCompleteDto {
  @IsString()
  @IsNotEmpty()
  objectKey!: string;

  @IsEnum(['image', 'video'])
  mediaType!: 'image' | 'video';

  @IsString()
  @MaxLength(255)
  mimeType!: string;
}
