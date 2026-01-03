// frontend/src/types/admin-ban-user.ts

export type BanUserPayload = {
  banned: boolean;
  reason?: string;
};

export type BanUserResponse = {
  success: true;
};

