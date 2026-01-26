// frontend/src/types/tagged-posts.ts

export type MyTaggedPostItem = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

export type MyTaggedPostsResponse = {
  items: MyTaggedPostItem[];
  nextCursor: string | null;
};
