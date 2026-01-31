// frontend/types/public-post-share.ts

/**
 * ==========================================
 * Public Post Share (Frontend Contract)
 * ==========================================
 * ใช้สำหรับ External Share / OG / SEO เท่านั้น
 *
 * ❗ ต้อง sync กับ backend
 *    backend/src/posts/public/dto/public-post-share.response.ts
 *
 * ❗ ห้ามใช้กับ authenticated / user interaction
 */
export type PublicPostShare = {
  /**
   * Post ID
   * - UUID string
   */
  id: string;

  /**
   * Plain text content of post
   * - frontend อาจ truncate สำหรับ OG
   */
  content: string;

  author: {
    /**
     * Public display name
     * - backend normalize แล้ว (ไม่เป็น null)
     * - ไม่รับประกัน uniqueness
     */
    displayName: string;
  };

  /**
   * First media only (0 หรือ 1 item)
   * - ใช้สำหรับ OG image / video
   */
  media: Array<{
    /**
     * Media type for OG
     */
    type: "image" | "video";

    /**
     * Fully-qualified CDN URL
     * - backend เป็นคนสร้างให้
     */
    cdnUrl: string;
    thumbnailUrl?: string;
    /**
     * Media dimension
     * - backend normalize เป็น number แล้ว
     */
    width: number;
    height: number;
  }>;

  /**
   * ISO-8601 timestamp
   * - e.g. 2026-01-31T12:34:56.789Z
   */
  createdAt: string;
};
