// backend/src/posts/public/dto/public-post-share.response.ts

/**
 * ==========================================
 * Public Post Share Response
 * ==========================================
 * Contract สำหรับ External Share (SEO / OG / Crawler)
 *
 * ❗ Stable public contract
 * ❗ ห้ามผูกกับ internal Prisma model
 * ❗ ห้ามมี nullable field ที่ external ต้อง handle เอง
 */
export type PublicPostShareResponse = {
  id: string;

  /**
   * Post text content (plain text)
   * - อาจถูก truncate ที่ frontend สำหรับ OG
   */
  content: string;

  author: {
    /**
     * Public display name
     * - backend ต้อง normalize แล้ว (ห้ามเป็น null)
     * - ไม่รับประกัน uniqueness
     */
    displayName: string;
  };

  /**
   * First media only (for OG / preview)
   * - จำกัด 0 หรือ 1 item
   */
  media: {
    type: 'image' | 'video';
    cdnUrl: string;
    thumbnailUrl?: string;
    width: number;
    height: number;
  }[];

  /**
   * ISO-8601 timestamp
   * - ใช้สำหรับ crawler / metadata
   */
  createdAt: string;
};
