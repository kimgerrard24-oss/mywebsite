// File: src/types/user.interface.ts
export interface User {
  id: string;            // internal uid
  provider: string;      // 'google' | 'facebook'
  providerId: string;    // provider's user id
  email?: string;
  name?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}
