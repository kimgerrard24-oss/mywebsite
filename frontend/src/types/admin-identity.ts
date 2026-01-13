// frontend/src/types/admin-identity.ts

export type AdminUpdateIdentityPayload = {
  username?: string;
  email?: string;
  phoneNumber?: string;
  reason: string;
};

export type AdminUpdateIdentityResponse = {
  success: true;
  updatedFields: string[];
};
