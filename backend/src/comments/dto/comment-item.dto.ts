// backend/src/comments/dto/comment-item.dto.ts
export class CommentItemDto {
  id!: string;
  content!: string;
  createdAt!: string;

  // ✏️ edit info
  isEdited!: boolean;
  editedAt?: string;

  // 👤 author
  author!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  // 🔐 permission (viewer-based)
  isOwner!: boolean;
}
