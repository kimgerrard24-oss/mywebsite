// backend/src/comments/dto/comment-item.dto.ts
export class CommentItemDto {
  id!: string;
  content!: string;
  createdAt!: string;

  isEdited!: boolean;
  editedAt?: string;

  author!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  
  isOwner!: boolean;

  likeCount!: number;
  isLiked!: boolean;
}
