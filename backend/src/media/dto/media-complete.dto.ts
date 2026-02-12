// backend/src/media/dto/media-complete.dto.ts
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ProfileMediaType } from '@prisma/client';

export class MediaCompleteDto {
  @IsString()
  @IsNotEmpty()
  objectKey!: string;

  @IsIn(['image', 'video'])
  mediaType!: 'image' | 'video';

  @IsString()
  @MaxLength(255)
  mimeType!: string;

  @IsOptional()
  @IsEnum(ProfileMediaType)
  mediaCategory?: ProfileMediaType;

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
