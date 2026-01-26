// frontend/src/types/tagged-posts.ts

export type MyTaggedPostUserTag = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "REMOVED";
};

export type MyTaggedPostItem = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;

  likeCount: number;
  commentCount: number;

  /**
   * Friend tags on this post (viewer-specific)
   * - normally length = 1 for tagged-post feed
   * - but keep as array for future-proof
   */
  userTags: MyTaggedPostUserTag[];
};

export type MyTaggedPostsResponse = {
  items: MyTaggedPostItem[];
  nextCursor: string | null;
};

