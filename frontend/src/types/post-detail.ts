// frontend/src/types/post-detail.ts
export type PostDetail = {
  id: string;
  content: string;
  createdAt: string;
  media: {
    id: string;
    type: string;
    url: string;
  }[];
};
