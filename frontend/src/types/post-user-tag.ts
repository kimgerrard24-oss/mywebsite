// frontend/src/types/post-user-tag.ts

export type PostUserTagStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "REMOVED";

export type PostUserTagItem = {
  id: string;
  status: PostUserTagStatus;

  taggedUser: {
    id: string;
    displayName: string | null;
    username: string;
    avatarUrl: string | null;
  };

  taggedBy: {
    id: string;
    displayName: string | null;
    username: string;
    avatarUrl: string | null;
  };

  isTaggedUser: boolean; // backend computed
  isPostOwner: boolean;  // backend computed
};
