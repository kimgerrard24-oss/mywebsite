// backend/src/media/dto/media-metadata.dto.ts

export class MediaMetadataDto {
  id!: string;
  type!: 'image' | 'video';
  url!: string;
  objectKey!: string;

  /**
   * 🔹 NEW
   * - CDN URL ของ video thumbnail
   * - undefined สำหรับ image
   */
  thumbnailUrl?: string;

  ownerUserId!: string;
  postId!: string | null;
  createdAt!: string;
  isOwner!: boolean;
  canAppeal?: boolean;
}

