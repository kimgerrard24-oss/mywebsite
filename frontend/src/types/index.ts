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
  author: User;
  text: string;
  media?: string[]; // URLs
  createdAt: string;
  likes: number;
  comments: number;
};

export type Message = {
  id: string;
  threadId: string;
  from: string;
  text: string;
  createdAt: string;
  read?: boolean;
};
