// frontend/src/types/admin-user.ts

export type AdminUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
};

export type AdminUsersResponse = {
  items: AdminUser[];
  page: number;
  limit: number;
  total: number;
};
