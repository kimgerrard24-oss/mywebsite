// frontend/src/types/public-post-detail.ts

export type PublicPostDetail = {
  id: string;
  content: string;
  createdAt: string;

  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  media: Array<{
    id: string;
    type: "image" | "video";
    url: string;
    cdnUrl?: string | null;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
  }>;
};
