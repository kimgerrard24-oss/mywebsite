// backend/src/media/entities/media.entity.ts
import { MediaType } from '@prisma/client';

export class MediaEntity {
  id!: string;
  ownerUserId!: string;
  objectKey!: string;
  mediaType!: MediaType; 
  mimeType!: string;
  width!: number | null;
  height!: number | null;
  duration!: number | null;
  createdAt!: Date;
  
}

