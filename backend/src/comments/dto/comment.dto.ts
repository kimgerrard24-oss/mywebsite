// backend/src/comments/dto/comment.dto.ts
export class CommentDto {
  id!: string;
  postId!: string;
  authorId!: string;
  content!: string;
  createdAt!: string;

  static fromEntity(entity: any): CommentDto {
    return {
      id: entity.id,
      postId: entity.postId,
      authorId: entity.authorId,
      content: entity.content,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
