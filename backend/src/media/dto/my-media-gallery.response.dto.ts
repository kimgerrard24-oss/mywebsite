// =======================================
// backend/src/media/dto/my-media-gallery.response.dto.ts
// =======================================
export interface MyMediaGalleryItemDto {
  mediaId: string;
  postId: string | null;
  type: 'IMAGE' | 'VIDEO';

  /**
   * ✅ Public CDN URLs (authoritative)
   */
  url: string;
  thumbnailUrl?: string | null;

  width?: number | null;
  height?: number | null;
  duration?: number | null;
  createdAt: Date;
}


export interface MyMediaGalleryResponseDto {
  items: MyMediaGalleryItemDto[];
  nextCursor: string | null;
}