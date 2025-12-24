// frontend/src/types/following.ts

export type Following = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;

  isFollowing: boolean; 
  canFollow: boolean;   
};

