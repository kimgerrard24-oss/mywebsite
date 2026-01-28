// frontend/src/types/admin-share.ts

export type AdminShareDetail = {
  id: string;
  postId: string;
  senderId: string;
  isDisabled: boolean;
  createdAt: string;
  disabledAt?: string | null;
};
