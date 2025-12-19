// frontend/src/types/post-detail.ts

export type PostDetail = {
  id: string;
  content: string;
  createdAt: string;

  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };

  media: {
    id: string;
    type: string;
    url: string;
  }[];

  canDelete: boolean;

};
