// frontend/src/types/my-media.ts

export type MyMediaGalleryItem = {
  mediaId: string;
  postId: string | null;
  type: "IMAGE" | "VIDEO";

  url: string;
  thumbnailUrl?: string | null;

  width?: number | null;
  height?: number | null;
  duration?: number | null;
  createdAt: string;
};



export type MyMediaGalleryResponse = {
  items: MyMediaGalleryItem[];
  nextCursor: string | null;
};