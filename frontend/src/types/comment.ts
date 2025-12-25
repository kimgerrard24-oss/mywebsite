// frontend/src/types/comment.ts

export type Comment = {
  id: string;
  content: string;
  createdAt: string;

  isEdited: boolean;
  editedAt?: string;

  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  isOwner: boolean;
};
