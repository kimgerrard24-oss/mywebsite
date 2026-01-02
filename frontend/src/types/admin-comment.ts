// frontend/src/types/admin-comment.ts

export type AdminDeleteCommentPayload = {
  commentId: string;
  reason?: string;
};

export type AdminDeleteCommentResult = {
  success: true;
};
