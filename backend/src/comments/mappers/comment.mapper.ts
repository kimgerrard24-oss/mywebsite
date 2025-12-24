// backend/src/comments/mappers/comment.mapper.ts
import { CommentItemDto } from '../dto/comment-item.dto';

export class CommentMapper {
  /**
   * =========================================
   * Map Comment → CommentItemDto
   * =========================================
   */
  static toItemDto(
    comment: any,
    viewerUserId: string | null,
  ): CommentItemDto {
    const isEdited =
      comment.updatedAt &&
      comment.createdAt &&
      comment.updatedAt.getTime() >
        comment.createdAt.getTime();

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),

      // ✏️ edit
      isEdited,
      editedAt: isEdited
        ? comment.updatedAt.toISOString()
        : undefined,

      // 👤 author
      author: {
        id: comment.author.id,
        displayName: comment.author.displayName ?? null,
        avatarUrl: comment.author.avatarUrl ?? null,
      },

      // 🔐 permission
      isOwner:
        !!viewerUserId &&
        comment.authorId === viewerUserId,
    };
  }

  /**
   * =========================================
   * Map list (pagination-safe)
   * =========================================
   */
  static toItemDtos(
    comments: any[],
    viewerUserId: string | null,
  ): CommentItemDto[] {
    return comments.map((c) =>
      this.toItemDto(c, viewerUserId),
    );
  }
}
