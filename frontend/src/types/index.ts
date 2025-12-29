// src/types/index.ts
export type User = {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
};

export type Post = {
  id: string;
  text: string;
  createdAt: string;

  author: {
    id: string;
    username?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  };

  likes: number;
  comments: number;

  // ===== เพิ่มใหม่ =====
  canDelete: boolean;
};

export type Message = {
  id: string;
  threadId: string;
  from: string;
  text: string;
  createdAt: string;
  read?: boolean;
};

export type MediaMetadata = {
  id: string;

  /**
   * รองรับ media ทุกประเภทที่ backend อนุญาต
   * backend = authority
   */
  type: "image" | "video" | "audio";

  url: string;
  objectKey: string;
  ownerUserId: string;
  postId: string | null;
  createdAt: string;
  isOwner: boolean;

  /**
   * optional (audio)
   * backend อาจส่งมา
   */
  durationSec?: number | null;
};
