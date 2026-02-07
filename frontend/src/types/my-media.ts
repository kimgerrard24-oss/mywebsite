// frontend/src/types/my-media.ts

export type MyMediaGalleryItem = {
  mediaId: string;
  postId: string;
  type: "IMAGE" | "VIDEO";
  objectKey: string;
  thumbnailObjectKey?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  createdAt: string;
};

export type MyMediaGalleryResponse = {
  items: MyMediaGalleryItem[];
  nextCursor: string | null;
};