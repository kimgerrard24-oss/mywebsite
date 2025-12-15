export interface PublicUserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  isSelf: boolean;
}
