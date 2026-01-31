// backend/src/media/dto/media-complete.dto.ts
import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class MediaCompleteDto {
  @IsString()
  @IsNotEmpty()
  objectKey!: string;

  @IsIn(['image', 'video'])
  mediaType!: 'image' | 'video';

  @IsString()
  @MaxLength(255)
  mimeType!: string;

  @IsString()
  @IsNotEmpty()
  thumbnailObjectKey?: string;
}
