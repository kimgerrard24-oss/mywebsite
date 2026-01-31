// backend/src/media/dto/media-complete.dto.ts
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
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

  /**
   * ✅ OPTIONAL
   * - video only
   * - async generated
   * - must NEVER block /media/complete
   */
  @IsOptional()
  @IsString()
  thumbnailObjectKey?: string;
}
