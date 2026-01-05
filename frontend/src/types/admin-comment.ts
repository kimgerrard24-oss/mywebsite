// frontend/src/types/admin-comment.ts

export type AdminDeleteCommentPayload = {
  commentId: string;
  reason?: string;
};

export type AdminDeleteCommentResult = {
  success: true;
};

export type AdminCommentDetail = {
  id: string;
  content: string;
  createdAt: string;

  isHidden: boolean;
  isDeleted: boolean;
  deletedSource?: string | null;

  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  post: {
    id: string;
    content: string;
    authorId: string;
  };
};
