// backend/src/comments/dto/comment.dto.ts
export class CommentDto {
  id!: string;
  postId!: string;
  authorId!: string;
  content!: string;
  createdAt!: string;

  /**
   * ❤️ Like metadata (optional)
   * - ไม่จำเป็นต้องมีทุก context
   * - ใช้เฉพาะใน view ที่ต้องการ
   */
  likeCount?: number;
  isLiked?: boolean;

  static fromEntity(entity: any): CommentDto {
    return {
      id: entity.id,
      postId: entity.postId,
      authorId: entity.authorId,
      content: entity.content,
      createdAt: entity.createdAt.toISOString(),

      /**
       * ⚠️ intentionally not mapping like fields here
       * เพราะ:
       * - entity บาง query ไม่มี _count / likes
       * - view-aware logic ต้องอยู่ใน Mapper
       */
    };
  }
}
